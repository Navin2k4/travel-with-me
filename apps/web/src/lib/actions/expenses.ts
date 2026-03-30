"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@travel-with-me/db";
import { prisma } from "@/lib/prisma";
import { computeSplit } from "@/lib/domain/split/compute-split";
import {
  decimalAmountToNumber,
  majorToMinorUnits,
  minorUnitsToDecimal,
  prepareComputeSplitInput,
} from "@/lib/money";
import {
  ComputeSplitSchema,
  CreateExpenseSchema,
  DeleteExpenseSchema,
  SettleSettlementSchema,
  UpdateExpenseSchema,
} from "@/lib/validations/expense";

export async function computeSplitAction(input: unknown) {
  const parsed = ComputeSplitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  try {
    const prepared = prepareComputeSplitInput({
      amountMajor: parsed.data.amount,
      splitType: parsed.data.splitType,
      participantIds: parsed.data.participantIds,
      splitDetails: parsed.data.splitDetails,
    });
    const rows = computeSplit(prepared);
    return { ok: true as const, data: rows };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Invalid split input.",
    };
  }
}

export async function createExpenseAction(input: unknown) {
  const parsed = CreateExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const payload = parsed.data;

  try {
    const prepared = prepareComputeSplitInput({
      amountMajor: payload.amount,
      splitType: payload.splitType,
      participantIds: payload.participantIds,
      splitDetails: payload.splitDetails,
    });
    const splitRows = computeSplit(prepared);

    await prisma.$transaction(async (tx) => {
      const membershipCount = await tx.tripParticipant.count({
        where: {
          tripId: payload.tripId,
          userId: { in: [payload.paidById, ...payload.participantIds] },
          isActive: true,
        },
      });

      if (membershipCount !== new Set([payload.paidById, ...payload.participantIds]).size) {
        throw new Error("Paid by and participants must belong to the trip.");
      }

      const expense = await tx.expense.create({
        data: {
          tripId: payload.tripId,
          title: payload.title,
          notes: payload.notes,
          amount: new Prisma.Decimal(String(payload.amount)),
          currency: payload.currency ?? "INR",
          paidById: payload.paidById,
          paymentMode: payload.paymentMode ?? "CASH",
          splitType: payload.splitType,
          splitDetails: payload.splitDetails,
          category: payload.category ?? "OTHER",
          customCategory: payload.customCategory?.trim() || null,
          recurrenceRule: payload.recurrenceRule ?? "NONE",
        },
      });

       await tx.expenseSplit.createMany({
        data: splitRows.map((row) => ({
          expenseId: expense.id,
          userId: row.userId,
          amount: minorUnitsToDecimal(row.amountMinor),
          percentageBp: row.percentageBp,
          shares: row.shares,
        })),
      });
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to create expense.",
    };
  }

  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function updateExpenseAction(input: unknown) {
  const parsed = UpdateExpenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const payload = parsed.data;
  try {
    const result = await prisma.expense.updateMany({
      where: { id: payload.expenseId, tripId: payload.tripId },
      data: {
        title: payload.title,
        notes: payload.notes || null,
        paidById: payload.paidById,
        paymentMode: payload.paymentMode,
        category: payload.category,
        customCategory: payload.customCategory?.trim() || null,
      },
    });
    if (result.count === 0) throw new Error("Expense not found for this trip.");
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to update expense." };
  }
  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function deleteExpenseAction(input: unknown) {
  const parsed = DeleteExpenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const payload = parsed.data;
  try {
    const result = await prisma.expense.deleteMany({
      where: { id: payload.expenseId, tripId: payload.tripId },
    });
    if (result.count === 0) throw new Error("Expense not found for this trip.");
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to delete expense." };
  }
  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function settleSettlementAction(input: unknown) {
  const parsed = SettleSettlementSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const payload = parsed.data;
  try {
    const result = await prisma.settlement.updateMany({
      where: { id: payload.settlementId, tripId: payload.tripId, isSettled: false },
      data: { isSettled: true, settledAt: new Date() },
    });
    if (result.count === 0) throw new Error("Settlement not found or already settled.");
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to settle." };
  }
  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function revokeSettlementAction(input: unknown) {
  const parsed = SettleSettlementSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const payload = parsed.data;
  try {
    const result = await prisma.settlement.updateMany({
      where: { id: payload.settlementId, tripId: payload.tripId, isSettled: true },
      data: { isSettled: false, settledAt: null },
    });
    if (result.count === 0) throw new Error("Settlement not found or not settled.");
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to revoke settlement." };
  }
  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function generateSettlementAction(input: { tripId: string }) {
  const { tripId } = input;
  if (!tripId) return { ok: false as const, error: "Trip ID is required." };

  const expenses = await prisma.expense.findMany({
    where: { tripId },
    select: {
      paidById: true,
      splits: {
        select: {
          userId: true,
          amount: true,
        },
      },
    },
  });

  // Direct person-to-person obligations:
  // For each split row, participant owes the payer (except self-paid share).
  const directMap = new Map<string, number>();
  for (const expense of expenses) {
    for (const split of expense.splits) {
      if (split.userId === expense.paidById) continue;
      const amountMinor = majorToMinorUnits(decimalAmountToNumber(split.amount));
      if (amountMinor <= 0) continue;
      const key = `${split.userId}|${expense.paidById}`;
      directMap.set(key, (directMap.get(key) ?? 0) + amountMinor);
    }
  }

  // Net reciprocal pairs so matrix tallies cleanly but stays person-to-person.
  const pairNet = new Map<string, number>();
  for (const [key, value] of directMap.entries()) {
    const [from, to] = key.split("|");
    const reverse = `${to}|${from}`;
    const reverseValue = directMap.get(reverse) ?? 0;
    if (value <= reverseValue) continue;
    pairNet.set(key, value - reverseValue);
  }

  const instructions = [...pairNet.entries()]
    .map(([key, amountMinor]) => {
      const [fromUserId, toUserId] = key.split("|");
      return { fromUserId, toUserId, amountMinor };
    })
    .sort(
      (a, b) =>
        b.amountMinor - a.amountMinor ||
        a.fromUserId.localeCompare(b.fromUserId) ||
        a.toUserId.localeCompare(b.toUserId),
    );

  await prisma.$transaction(async (tx) => {
    await tx.settlement.deleteMany({ where: { tripId, isSettled: false } });
    if (instructions.length > 0) {
      await tx.settlement.createMany({
        data: instructions.map((item) => ({
          tripId,
          fromUserId: item.fromUserId,
          toUserId: item.toUserId,
          amount: minorUnitsToDecimal(item.amountMinor),
        })),
      });
    }
  });

  revalidatePath(`/trips/${tripId}`);
  return { ok: true as const, data: instructions };
}
