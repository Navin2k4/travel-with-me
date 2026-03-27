"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeSplit } from "@/lib/domain/split/compute-split";
import {
  ComputeSplitSchema,
  CreateExpenseSchema,
  DeleteExpenseSchema,
  SettleSettlementSchema,
  UpdateExpenseSchema,
} from "@/lib/validations/expense";
import { generateSettlement } from "@/lib/domain/settlement/generate-settlement";

export async function computeSplitAction(input: unknown) {
  const parsed = ComputeSplitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  try {
    const rows = computeSplit(parsed.data);
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
    const splitRows = computeSplit({
      amountMinor: payload.amountMinor,
      splitType: payload.splitType,
      participantIds: payload.participantIds,
      splitDetails: payload.splitDetails,
    });

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
          amountMinor: payload.amountMinor,
          currency: payload.currency ?? "INR",
          paidById: payload.paidById,
          paymentMode: payload.paymentMode ?? "CASH",
          splitType: payload.splitType,
          splitDetails: payload.splitDetails,
          category: payload.category ?? "OTHER",
          recurrenceRule: payload.recurrenceRule ?? "NONE",
        },
      });

      await tx.expenseSplit.createMany({
        data: splitRows.map((row) => ({
          expenseId: expense.id,
          userId: row.userId,
          amountMinor: row.amountMinor,
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

export async function generateSettlementAction(input: { tripId: string }) {
  const { tripId } = input;
  if (!tripId) return { ok: false as const, error: "Trip ID is required." };

  const [payers, owed] = await Promise.all([
    prisma.expense.groupBy({
      by: ["paidById"],
      where: { tripId },
      _sum: { amountMinor: true },
    }),
    prisma.expenseSplit.groupBy({
      by: ["userId"],
      where: { expense: { tripId } },
      _sum: { amountMinor: true },
    }),
  ]);

  const allUsers = new Set<string>();
  for (const row of payers) allUsers.add(row.paidById);
  for (const row of owed) allUsers.add(row.userId);

  const ledger = [...allUsers].map((userId) => ({
    userId,
    paidMinor: payers.find((row) => row.paidById === userId)?._sum.amountMinor ?? 0,
    owedMinor: owed.find((row) => row.userId === userId)?._sum.amountMinor ?? 0,
  }));

  const instructions = generateSettlement(ledger);

  await prisma.$transaction(async (tx) => {
    await tx.settlement.deleteMany({ where: { tripId, isSettled: false } });
    if (instructions.length > 0) {
      await tx.settlement.createMany({
        data: instructions.map((item) => ({
          tripId,
          fromUserId: item.fromUserId,
          toUserId: item.toUserId,
          amountMinor: item.amountMinor,
        })),
      });
    }
  });

  revalidatePath(`/trips/${tripId}`);
  return { ok: true as const, data: instructions };
}
