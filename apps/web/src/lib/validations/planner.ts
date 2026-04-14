import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

export const CreatePlannedPlaceSchema = z.object({
  tripId: z.string().min(1),
  googlePlaceId: z.string().trim().min(1).max(300),
  name: z.string().trim().min(1).max(200),
  formattedAddress: optionalTrimmedString(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  mapUrl: z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().url().max(2000).optional()),
});

export const ReorderPlannedPlacesSchema = z.object({
  tripId: z.string().min(1),
  orderedPlaceIds: z.array(z.string().min(1)).min(1),
});

export const RemovePlannedPlaceSchema = z.object({
  tripId: z.string().min(1),
  plannedPlaceId: z.string().min(1),
});
