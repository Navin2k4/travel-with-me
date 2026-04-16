"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  AddParticipantsSchema,
  AssignParticipantTagSchema,
  CreateTripSchema,
  RequestJoinTripSchema,
  ToggleTripWishlistSchema,
  ReviewJoinRequestSchema,
  UpdateTripCoverImageSchema,
  UpdateTripSchema,
} from "@/lib/validations/trip";
import { getCurrentUser } from "@/lib/auth/session";

export async function createTripAction(input: unknown) {
  const parsed = CreateTripSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const payload = parsed.data;
  const participantSet = new Set([payload.createdById, ...payload.participantIds]);

  const trip = await prisma.$transaction(async (tx) => {
    const created = await tx.trip.create({
      data: {
        title: payload.title,
        description: payload.description,
        coverImage: payload.coverImage ?? null,
        startPoint: payload.startPoint ?? null,
        dateFlexibility: payload.dateFlexibility ?? "FIXED",
        transportMode: payload.transportMode ?? null,
        transportNotes: payload.transportNotes ?? null,
        status: payload.status ?? "PLANNING",
        createdById: payload.createdById,
        startDate: payload.startDate,
        endDate: payload.endDate,
      },
    });

    await tx.tripParticipant.createMany({
      data: [...participantSet].map((userId) => ({
        tripId: created.id,
        userId,
      })),
      skipDuplicates: true,
    });

    return created;
  });

  revalidatePath("/");
  return { ok: true as const, data: trip };
}

export async function addParticipantsAction(input: unknown) {
  const parsed = AddParticipantsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  await prisma.tripParticipant.createMany({
    data: parsed.data.participantIds.map((userId) => ({
      tripId: parsed.data.tripId,
      userId,
    })),
    skipDuplicates: true,
  });

  revalidatePath(`/trips/${parsed.data.tripId}`);
  return { ok: true as const };
}

export async function assignParticipantTagAction(input: unknown) {
  const parsed = AssignParticipantTagSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const { tripId, userId, customLabel } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const participant = await tx.tripParticipant.findUnique({
        where: { tripId_userId: { tripId, userId } },
        select: { userId: true },
      });
      if (!participant) {
        throw new Error("Participant not found in this trip.");
      }

      const tag = await tx.tripTag.upsert({
        where: { tripId_label: { tripId, label: customLabel } },
        update: {},
        create: {
          tripId,
          label: customLabel,
          isCustom: true,
        },
      });

      if (!tag) {
        throw new Error("Tag not found.");
      }

      await tx.tripParticipantTag.upsert({
        where: {
          tripId_userId_tagId: {
            tripId,
            userId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          tripId,
          userId,
          tagId: tag.id,
        },
      });
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to assign tag.",
    };
  }

  revalidatePath(`/trips/${tripId}`);
  return { ok: true as const };
}

export async function updateTripAction(input: unknown) {
  const parsed = UpdateTripSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const payload = parsed.data;

  try {
    await prisma.trip.update({
      where: { id: payload.tripId },
      data: {
        title: payload.title,
        description: payload.description || null,
        coverImage: payload.coverImage === undefined ? undefined : payload.coverImage,
        startPoint: payload.startPoint === undefined ? undefined : (payload.startPoint || null),
        dateFlexibility: payload.dateFlexibility ?? undefined,
        transportMode: payload.transportMode === undefined ? undefined : payload.transportMode,
        transportNotes: payload.transportNotes === undefined ? undefined : (payload.transportNotes || null),
        status: payload.status ?? undefined,
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        endDate: payload.endDate ? new Date(payload.endDate) : null,
      },
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to update trip.",
    };
  }

  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function updateTripCoverImageAction(input: unknown) {
  const parsed = UpdateTripCoverImageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const payload = parsed.data;

  try {
    await prisma.trip.update({
      where: { id: payload.tripId },
      data: { coverImage: payload.coverImage },
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to update trip cover image.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/trips/${payload.tripId}`);
  return { ok: true as const };
}

export async function requestJoinTripAction(input: unknown) {
  const parsed = RequestJoinTripSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }
  const currentUser = await getCurrentUser();
  if (!currentUser) return { ok: false as const, error: "You must be logged in." };

  const { tripId } = parsed.data;
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, createdById: true, status: true },
    });
    if (!trip) throw new Error("Trip not found.");
    if (trip.createdById === currentUser.id) throw new Error("You already own this trip.");
    if (trip.status === "ENDED") throw new Error("This trip has ended. Join requests are closed.");

    const membership = await prisma.tripParticipant.findUnique({
      where: { tripId_userId: { tripId, userId: currentUser.id } },
      select: { isActive: true },
    });
    if (membership?.isActive) throw new Error("You already have access to this trip.");

    await prisma.tripJoinRequest.upsert({
      where: { tripId_requesterId: { tripId, requesterId: currentUser.id } },
      create: {
        tripId,
        requesterId: currentUser.id,
        status: "PENDING",
      },
      update: {
        status: "PENDING",
        reviewedAt: null,
      },
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to request access.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/trips/${tripId}`);
  return { ok: true as const };
}

export async function toggleTripWishlistAction(input: unknown) {
  const parsed = ToggleTripWishlistSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) return { ok: false as const, error: "You must be logged in." };

  const { tripId } = parsed.data;

  try {
    const existing = await prisma.tripWishlist.findUnique({
      where: { userId_tripId: { userId: currentUser.id, tripId } },
      select: { userId: true },
    });

    if (existing) {
      await prisma.tripWishlist.delete({
        where: { userId_tripId: { userId: currentUser.id, tripId } },
      });
    } else {
      await prisma.tripWishlist.create({
        data: {
          userId: currentUser.id,
          tripId,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath(`/trips/${tripId}`);
    return { ok: true as const, data: { wishlisted: !existing } };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to update wishlist.",
    };
  }
}

export async function reviewJoinRequestAction(input: unknown) {
  const parsed = ReviewJoinRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }
  const currentUser = await getCurrentUser();
  if (!currentUser) return { ok: false as const, error: "You must be logged in." };

  const { tripId, requestId, decision } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        select: { createdById: true },
      });
      if (!trip) throw new Error("Trip not found.");
      if (trip.createdById !== currentUser.id) throw new Error("Only trip creator can review requests.");

      const request = await tx.tripJoinRequest.findUnique({
        where: { id: requestId },
        select: { id: true, tripId: true, requesterId: true, status: true },
      });
      if (!request || request.tripId !== tripId) throw new Error("Join request not found.");
      if (request.status !== "PENDING") throw new Error("Request already reviewed.");

      await tx.tripJoinRequest.update({
        where: { id: requestId },
        data: { status: decision, reviewedAt: new Date() },
      });

      if (decision === "APPROVED") {
        await tx.tripParticipant.upsert({
          where: {
            tripId_userId: {
              tripId,
              userId: request.requesterId,
            },
          },
          update: { isActive: true },
          create: {
            tripId,
            userId: request.requesterId,
            isActive: true,
          },
        });
      }
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to review join request.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/trips/${tripId}`);
  return { ok: true as const };
}
