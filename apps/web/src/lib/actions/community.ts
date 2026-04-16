"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  CreateCommunityMessageSchema,
  CreateCommunityThreadSchema,
  DeleteCommunityMessageSchema,
  DeleteCommunityThreadSchema,
  EditCommunityMessageSchema,
  EditCommunityThreadSchema,
  VoteCommunityThreadSchema,
} from "@/lib/validations/community";

async function ensureTripExists(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true },
  });
  return Boolean(trip);
}

export async function createCommunityThreadAction(input: unknown) {
  const parsed = CreateCommunityThreadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  const { tripId, body } = parsed.data;
  const exists = await ensureTripExists(tripId);
  if (!exists) return { ok: false as const, error: "Trip not found." };

  try {
    const normalizedBody = body.trim();
    const generatedTitle = normalizedBody.slice(0, 80);
    await prisma.tripCommunityThread.create({
      data: {
        tripId,
        authorId: user.id,
        title: generatedTitle || "Community message",
        body: normalizedBody,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to create thread.",
    };
  }
}

export async function createCommunityMessageAction(input: unknown) {
  const parsed = CreateCommunityMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  const { tripId, threadId, body, parentId } = parsed.data;
  const exists = await ensureTripExists(tripId);
  if (!exists) return { ok: false as const, error: "Trip not found." };

  try {
    const thread = await prisma.tripCommunityThread.findUnique({
      where: { id: threadId },
      select: { tripId: true },
    });
    if (!thread || thread.tripId !== tripId) {
      return { ok: false as const, error: "Thread not found for this trip." };
    }

    if (parentId) {
      const parent = await prisma.tripCommunityMessage.findUnique({
        where: { id: parentId },
        select: { threadId: true },
      });
      if (!parent || parent.threadId !== threadId) {
        return { ok: false as const, error: "Reply target not found." };
      }
    }

    await prisma.tripCommunityMessage.create({
      data: {
        threadId,
        authorId: user.id,
        body,
        parentId: parentId ?? null,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to add message.",
    };
  }
}

export async function voteCommunityThreadAction(input: unknown) {
  const parsed = VoteCommunityThreadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  const { tripId, threadId, vote } = parsed.data;
  const exists = await ensureTripExists(tripId);
  if (!exists) return { ok: false as const, error: "Trip not found." };

  try {
    const thread = await prisma.tripCommunityThread.findUnique({
      where: { id: threadId },
      select: { tripId: true },
    });
    if (!thread || thread.tripId !== tripId) {
      return { ok: false as const, error: "Thread not found for this trip." };
    }

    if (vote === "NONE") {
      await prisma.tripCommunityThreadVote.deleteMany({
        where: { threadId, userId: user.id },
      });
    } else {
      await prisma.tripCommunityThreadVote.upsert({
        where: { threadId_userId: { threadId, userId: user.id } },
        create: {
          threadId,
          userId: user.id,
          value: vote === "UP" ? 1 : -1,
        },
        update: { value: vote === "UP" ? 1 : -1 },
      });
    }

    revalidatePath(`/trips/${tripId}`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to vote on thread.",
    };
  }
}

export async function editCommunityThreadAction(input: unknown) {
  const parsed = EditCommunityThreadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  const { tripId, threadId, body } = parsed.data;
  try {
    const thread = await prisma.tripCommunityThread.findUnique({
      where: { id: threadId },
      select: { tripId: true, authorId: true, isDeleted: true },
    });
    if (!thread || thread.tripId !== tripId) {
      return { ok: false as const, error: "Thread not found for this trip." };
    }
    if (thread.authorId !== user.id) {
      return { ok: false as const, error: "You can only edit your own message." };
    }
    if (thread.isDeleted) {
      return { ok: false as const, error: "Deleted messages cannot be edited." };
    }

    await prisma.tripCommunityThread.update({
      where: { id: threadId },
      data: {
        body: body.trim(),
        title: body.trim().slice(0, 80) || "Community message",
      },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath(`/trips/${tripId}/community`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to edit message.",
    };
  }
}

export async function deleteCommunityThreadAction(input: unknown) {
  const parsed = DeleteCommunityThreadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  const { tripId, threadId } = parsed.data;
  try {
    const thread = await prisma.tripCommunityThread.findUnique({
      where: { id: threadId },
      select: { tripId: true, authorId: true },
    });
    if (!thread || thread.tripId !== tripId) {
      return { ok: false as const, error: "Thread not found for this trip." };
    }
    if (thread.authorId !== user.id) {
      return { ok: false as const, error: "You can only delete your own message." };
    }

    await prisma.tripCommunityThread.update({
      where: { id: threadId },
      data: { isDeleted: true },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath(`/trips/${tripId}/community`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to delete message.",
    };
  }
}

export async function editCommunityMessageAction(input: unknown) {
  const parsed = EditCommunityMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  const { tripId, threadId, messageId, body } = parsed.data;
  try {
    const thread = await prisma.tripCommunityThread.findUnique({
      where: { id: threadId },
      select: { tripId: true },
    });
    if (!thread || thread.tripId !== tripId) {
      return { ok: false as const, error: "Thread not found for this trip." };
    }

    const message = await prisma.tripCommunityMessage.findUnique({
      where: { id: messageId },
      select: { threadId: true, authorId: true, isDeleted: true },
    });
    if (!message || message.threadId !== threadId) {
      return { ok: false as const, error: "Message not found." };
    }
    if (message.authorId !== user.id) {
      return { ok: false as const, error: "You can only edit your own message." };
    }
    if (message.isDeleted) {
      return { ok: false as const, error: "Deleted messages cannot be edited." };
    }

    await prisma.tripCommunityMessage.update({
      where: { id: messageId },
      data: { body: body.trim() },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath(`/trips/${tripId}/community`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to edit reply.",
    };
  }
}

export async function deleteCommunityMessageAction(input: unknown) {
  const parsed = DeleteCommunityMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  const { tripId, threadId, messageId } = parsed.data;
  try {
    const thread = await prisma.tripCommunityThread.findUnique({
      where: { id: threadId },
      select: { tripId: true },
    });
    if (!thread || thread.tripId !== tripId) {
      return { ok: false as const, error: "Thread not found for this trip." };
    }

    const message = await prisma.tripCommunityMessage.findUnique({
      where: { id: messageId },
      select: { threadId: true, authorId: true },
    });
    if (!message || message.threadId !== threadId) {
      return { ok: false as const, error: "Message not found." };
    }
    if (message.authorId !== user.id) {
      return { ok: false as const, error: "You can only delete your own message." };
    }

    await prisma.tripCommunityMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath(`/trips/${tripId}/community`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to delete reply.",
    };
  }
}
