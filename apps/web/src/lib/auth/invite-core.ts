import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function generateInviteToken() {
  return randomBytes(24).toString("base64url");
}

export async function validateInviteToken(token: string) {
  const invite = await prisma.tripInvite.findUnique({
    where: { token },
    include: {
      trip: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!invite) return { valid: false as const, reason: "invalid" as const };
  if (!invite.isActive) return { valid: false as const, reason: "disabled" as const };
  if (invite.expiresAt && invite.expiresAt < new Date()) return { valid: false as const, reason: "expired" as const };
  if (invite.maxUses !== null && invite.maxUses !== undefined && invite.usedCount >= invite.maxUses) {
    return { valid: false as const, reason: "max_uses_reached" as const };
  }
  return { valid: true as const, invite };
}

export async function acceptInviteForUser(token: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const invite = await tx.tripInvite.findUnique({
      where: { token },
      select: { id: true, tripId: true, isActive: true, expiresAt: true, maxUses: true, usedCount: true },
    });

    if (!invite) return { ok: false as const, reason: "invalid" as const };
    if (!invite.isActive) return { ok: false as const, reason: "disabled" as const };
    if (invite.expiresAt && invite.expiresAt < new Date()) return { ok: false as const, reason: "expired" as const };
    if (invite.maxUses !== null && invite.maxUses !== undefined && invite.usedCount >= invite.maxUses) {
      return { ok: false as const, reason: "max_uses_reached" as const };
    }

    const existing = await tx.tripParticipant.findUnique({
      where: { tripId_userId: { tripId: invite.tripId, userId } },
      select: { userId: true },
    });

    if (existing) {
      return { ok: true as const, tripId: invite.tripId, alreadyJoined: true as const };
    }

    await tx.tripParticipant.create({
      data: {
        tripId: invite.tripId,
        userId,
      },
    });

    await tx.tripInvite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return { ok: true as const, tripId: invite.tripId, alreadyJoined: false as const };
  });
}
