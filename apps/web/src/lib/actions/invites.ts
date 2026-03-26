"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { acceptInviteForUser, generateInviteToken, validateInviteToken } from "@/lib/auth/invite-core";
import { prisma } from "@/lib/prisma";
import {
  CreateInviteSchema,
  DisableInviteSchema,
  RegenerateInviteSchema,
  TokenSchema,
} from "@/lib/validations/invite";

async function requireTripMember(tripId: string, userId: string) {
  const member = await prisma.tripParticipant.findUnique({
    where: { tripId_userId: { tripId, userId } },
    select: { userId: true },
  });
  return !!member;
}

export async function createInviteLinkAction(input: unknown) {
  const parsed = CreateInviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Unauthorized." };

  const payload = parsed.data;
  const isMember = await requireTripMember(payload.tripId, user.id);
  if (!isMember) return { ok: false as const, error: "Only trip members can create invites." };

  const token = generateInviteToken();
  const invite = await prisma.tripInvite.create({
    data: {
      tripId: payload.tripId,
      token,
      createdById: user.id,
      expiresAt: payload.expiresAt,
      maxUses: payload.maxUses,
    },
  });

  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const, data: { inviteId: invite.id, path: `/invite/${invite.token}` } };
}

export async function validateInviteAction(input: unknown) {
  const parsed = TokenSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const result = await validateInviteToken(parsed.data.token);
  if (!result.valid) return { ok: false as const, error: result.reason };
  return {
    ok: true as const,
    data: {
      tripId: result.invite.trip.id,
      tripTitle: result.invite.trip.title,
      createdByName: result.invite.createdBy.name,
      expiresAt: result.invite.expiresAt,
      maxUses: result.invite.maxUses,
      usedCount: result.invite.usedCount,
    },
  };
}

export async function acceptInviteAction(input: unknown) {
  const parsed = TokenSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Unauthorized." };

  const result = await acceptInviteForUser(parsed.data.token, user.id);
  if (!result.ok) return { ok: false as const, error: result.reason };

  revalidatePath(`/trips/${result.tripId}`);
  return { ok: true as const, data: { tripId: result.tripId, alreadyJoined: result.alreadyJoined } };
}

export async function acceptInviteAfterSignupAction(input: unknown) {
  return acceptInviteAction(input);
}

export async function disableInviteAction(input: unknown) {
  const parsed = DisableInviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Unauthorized." };

  const payload = parsed.data;
  const isMember = await requireTripMember(payload.tripId, user.id);
  if (!isMember) return { ok: false as const, error: "Only trip members can disable invites." };

  await prisma.tripInvite.updateMany({
    where: { id: payload.inviteId, tripId: payload.tripId },
    data: { isActive: false },
  });

  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function regenerateInviteAction(input: unknown) {
  const parsed = RegenerateInviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Unauthorized." };
  const payload = parsed.data;
  const isMember = await requireTripMember(payload.tripId, user.id);
  if (!isMember) return { ok: false as const, error: "Only trip members can regenerate invites." };

  const oldInvite = await prisma.tripInvite.findUnique({ where: { id: payload.inviteId } });
  if (!oldInvite || oldInvite.tripId !== payload.tripId) {
    return { ok: false as const, error: "Invite not found." };
  }

  const token = generateInviteToken();
  await prisma.$transaction(async (tx) => {
    await tx.tripInvite.update({
      where: { id: oldInvite.id },
      data: { isActive: false },
    });
    await tx.tripInvite.create({
      data: {
        tripId: oldInvite.tripId,
        token,
        createdById: user.id,
        expiresAt: oldInvite.expiresAt,
        maxUses: oldInvite.maxUses,
      },
    });
  });

  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const, data: { path: `/invite/${token}` } };
}
