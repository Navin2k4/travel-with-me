"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  CreatePlannedPlaceSchema,
  RemovePlannedPlaceSchema,
  ReorderPlannedPlacesSchema,
} from "@/lib/validations/planner";

async function assertTripAccess(tripId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to use the planner.");
  }

  const membership = await prisma.tripParticipant.findUnique({
    where: {
      tripId_userId: {
        tripId,
        userId: user.id,
      },
    },
    select: {
      isActive: true,
    },
  });

  if (!membership?.isActive) {
    throw new Error("You do not have access to this trip planner.");
  }

  return user;
}

function revalidatePlannerPaths(tripId: string) {
  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/planner`);
}

export async function createPlannedPlaceAction(input: unknown) {
  const parsed = CreatePlannedPlaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;

  try {
    const user = await assertTripAccess(payload.tripId);

    const created = await prisma.$transaction(async (tx) => {
      const existing = await tx.tripPlannedPlace.findUnique({
        where: {
          tripId_googlePlaceId: {
            tripId: payload.tripId,
            googlePlaceId: payload.googlePlaceId,
          },
        },
      });
      if (existing) return existing;

      const aggregate = await tx.tripPlannedPlace.aggregate({
        where: { tripId: payload.tripId },
        _max: { position: true },
      });

      return tx.tripPlannedPlace.create({
        data: {
          tripId: payload.tripId,
          googlePlaceId: payload.googlePlaceId,
          name: payload.name,
          formattedAddress: payload.formattedAddress ?? null,
          latitude: payload.latitude,
          longitude: payload.longitude,
          mapUrl: payload.mapUrl ?? null,
          position: (aggregate._max.position ?? -1) + 1,
          createdById: user.id,
        },
      });
    });

    revalidatePlannerPaths(payload.tripId);
    return { ok: true as const, data: created };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to add place to planner.",
    };
  }
}

export async function reorderPlannedPlacesAction(input: unknown) {
  const parsed = ReorderPlannedPlacesSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;
  try {
    await assertTripAccess(payload.tripId);

    const uniqueIds = [...new Set(payload.orderedPlaceIds)];
    if (uniqueIds.length !== payload.orderedPlaceIds.length) {
      throw new Error("Duplicate places are not allowed in planner order.");
    }

    const places = await prisma.tripPlannedPlace.findMany({
      where: { tripId: payload.tripId },
      select: { id: true },
    });
    const existingIds = new Set(places.map((place) => place.id));
    if (existingIds.size !== uniqueIds.length || uniqueIds.some((id) => !existingIds.has(id))) {
      throw new Error("Planner order is out of sync. Refresh and try again.");
    }

    await prisma.$transaction(
      uniqueIds.map((placeId, index) =>
        prisma.tripPlannedPlace.update({
          where: { id: placeId },
          data: { position: index },
        }),
      ),
    );

    revalidatePlannerPaths(payload.tripId);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to reorder places.",
    };
  }
}

export async function removePlannedPlaceAction(input: unknown) {
  const parsed = RemovePlannedPlaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;
  try {
    await assertTripAccess(payload.tripId);

    await prisma.$transaction(async (tx) => {
      const removed = await tx.tripPlannedPlace.deleteMany({
        where: {
          id: payload.plannedPlaceId,
          tripId: payload.tripId,
        },
      });

      if (removed.count === 0) {
        throw new Error("Planner place not found.");
      }

      const remaining = await tx.tripPlannedPlace.findMany({
        where: { tripId: payload.tripId },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });

      await Promise.all(
        remaining.map((place, index) =>
          tx.tripPlannedPlace.update({
            where: { id: place.id },
            data: { position: index },
          }),
        ),
      );
    });

    revalidatePlannerPaths(payload.tripId);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to remove place.",
    };
  }
}
