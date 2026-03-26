"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  AddMediaToPlaceSchema,
  CreateVisitedPlaceSchema,
  DeleteVisitedPlaceSchema,
  RatePlaceSchema,
  ToggleVisitedUserSchema,
  UpdateVisitedPlaceSchema,
} from "@/lib/validations/visited-place";

function revalidateTrip(tripId: string) {
  revalidatePath(`/trips/${tripId}`);
}

export async function createVisitedPlaceAction(input: unknown) {
  const parsed = CreateVisitedPlaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const memberIds = new Set([payload.addedById, ...(payload.visitorIds ?? [])]);
      const memberships = await tx.tripParticipant.count({
        where: { tripId: payload.tripId, userId: { in: [...memberIds] }, isActive: true },
      });
      if (memberships !== memberIds.size) throw new Error("All selected users must be trip participants.");

      const place = await tx.visitedPlace.create({
        data: {
          tripId: payload.tripId,
          name: payload.name,
          category: payload.category,
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address,
          visitedAt: payload.visitedAt ?? new Date(),
          dayNumber: payload.dayNumber,
          notes: payload.notes,
          tags: payload.tags ?? [],
          rating: payload.rating,
          wouldRecommend: payload.wouldRecommend,
          addedById: payload.addedById,
        },
      });

      const visitorIds = [...new Set([payload.addedById, ...(payload.visitorIds ?? [])])];
      if (visitorIds.length > 0) {
        await tx.visitedPlaceUser.createMany({
          data: visitorIds.map((userId) => ({ visitedPlaceId: place.id, userId })),
          skipDuplicates: true,
        });
      }

      if (payload.expenseIds && payload.expenseIds.length > 0) {
        await tx.placeExpense.createMany({
          data: payload.expenseIds.map((expenseId) => ({ visitedPlaceId: place.id, expenseId })),
          skipDuplicates: true,
        });
      }

      return place;
    });

    revalidateTrip(payload.tripId);
    return { ok: true as const, data: result };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to create place." };
  }
}

export async function updateVisitedPlaceAction(input: unknown) {
  const parsed = UpdateVisitedPlaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;
  try {
    const result = await prisma.visitedPlace.updateMany({
      where: { id: payload.visitedPlaceId, tripId: payload.tripId },
      data: {
        name: payload.name,
        category: payload.category,
        latitude: payload.latitude === undefined ? undefined : payload.latitude,
        longitude: payload.longitude === undefined ? undefined : payload.longitude,
        address: payload.address === undefined ? undefined : payload.address,
        visitedAt: payload.visitedAt,
        dayNumber: payload.dayNumber === undefined ? undefined : payload.dayNumber,
        notes: payload.notes === undefined ? undefined : payload.notes,
        tags: payload.tags,
        wouldRecommend: payload.wouldRecommend === undefined ? undefined : payload.wouldRecommend,
      },
    });
    if (result.count === 0) throw new Error("Visited place not found for this trip.");
    revalidateTrip(payload.tripId);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to update place." };
  }
}

export async function deleteVisitedPlaceAction(input: unknown) {
  const parsed = DeleteVisitedPlaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;
  try {
    const result = await prisma.visitedPlace.deleteMany({
      where: { id: payload.visitedPlaceId, tripId: payload.tripId },
    });
    if (result.count === 0) throw new Error("Visited place not found for this trip.");
    revalidateTrip(payload.tripId);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to delete place." };
  }
}

export async function addMediaToPlaceAction(input: unknown) {
  const parsed = AddMediaToPlaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;
  try {
    const place = await prisma.visitedPlace.findUnique({
      where: { id: payload.visitedPlaceId },
      select: { tripId: true },
    });
    if (!place || place.tripId !== payload.tripId) throw new Error("Visited place does not belong to the trip.");

    const media = await prisma.media.create({
      data: { visitedPlaceId: payload.visitedPlaceId, url: payload.url, type: payload.type },
    });
    revalidateTrip(payload.tripId);
    return { ok: true as const, data: media };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to add media." };
  }
}

export async function toggleVisitedUserAction(input: unknown) {
  const parsed = ToggleVisitedUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const payload = parsed.data;

  try {
    const membership = await prisma.tripParticipant.findUnique({
      where: { tripId_userId: { tripId: payload.tripId, userId: payload.userId } },
      select: { userId: true },
    });
    if (!membership) throw new Error("User is not a participant of this trip.");

    const existing = await prisma.visitedPlaceUser.findUnique({
      where: { visitedPlaceId_userId: { visitedPlaceId: payload.visitedPlaceId, userId: payload.userId } },
    });

    if (existing) {
      await prisma.visitedPlaceUser.delete({
        where: { visitedPlaceId_userId: { visitedPlaceId: payload.visitedPlaceId, userId: payload.userId } },
      });
    } else {
      await prisma.visitedPlaceUser.create({
        data: { visitedPlaceId: payload.visitedPlaceId, userId: payload.userId },
      });
    }

    revalidateTrip(payload.tripId);
    return { ok: true as const, data: { visited: !existing } };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to update visited users." };
  }
}

export async function ratePlaceAction(input: unknown) {
  const parsed = RatePlaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const payload = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const place = await tx.visitedPlace.findFirst({
        where: { id: payload.visitedPlaceId, tripId: payload.tripId },
        select: { id: true },
      });
      if (!place) throw new Error("Visited place not found for this trip.");

      await tx.visitedPlaceRating.upsert({
        where: {
          visitedPlaceId_userId: {
            visitedPlaceId: payload.visitedPlaceId,
            userId: payload.userId,
          },
        },
        update: {
          rating: payload.rating,
          wouldRecommend: payload.wouldRecommend,
        },
        create: {
          visitedPlaceId: payload.visitedPlaceId,
          userId: payload.userId,
          rating: payload.rating,
          wouldRecommend: payload.wouldRecommend,
        },
      });

      const aggregate = await tx.visitedPlaceRating.aggregate({
        where: { visitedPlaceId: payload.visitedPlaceId },
        _avg: { rating: true },
      });

      await tx.visitedPlace.update({
        where: { id: payload.visitedPlaceId },
        data: { rating: aggregate._avg.rating ? Math.round(aggregate._avg.rating) : null },
      });
    });

    revalidateTrip(payload.tripId);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to rate place." };
  }
}
