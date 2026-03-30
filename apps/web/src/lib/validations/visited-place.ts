import { z } from "zod";
import { PlaceCategorySchema } from "@/lib/places/place-categories";

export { PlaceCategorySchema };
export const MediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);

const createOptionalLocationUrl = z.preprocess((val) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val !== "string") return val;
  const t = val.trim();
  return t === "" ? undefined : t;
}, z.string().url({ message: "Use a valid link (https://...)" }).max(2048).optional());

const updateOptionalLocationUrl = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val !== "string") return val;
  const t = val.trim();
  if (t === "") return null;
  return t;
}, z.union([z.string().url({ message: "Use a valid link (https://...)" }).max(2048), z.null()]).optional());

export const CreateVisitedPlaceSchema = z.object({
  tripId: z.string().min(1),
  name: z.string().trim().min(1).max(160),
  category: PlaceCategorySchema.default("OTHER"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().trim().max(500).optional(),
  locationUrl: createOptionalLocationUrl,
  visitedAt: z.coerce.date().optional(),
  dayNumber: z.number().int().positive().optional(),
  notes: z.string().trim().max(4000).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
  addedById: z.string().min(1),
  visitorIds: z.array(z.string().min(1)).optional(),
  expenseIds: z.array(z.string().min(1)).optional(),
});

export const UpdateVisitedPlaceSchema = z.object({
  visitedPlaceId: z.string().min(1),
  tripId: z.string().min(1),
  name: z.string().trim().min(1).max(160).optional(),
  category: PlaceCategorySchema.optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  locationUrl: updateOptionalLocationUrl,
  visitedAt: z.coerce.date().optional(),
  dayNumber: z.number().int().positive().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  wouldRecommend: z.boolean().nullable().optional(),
});

export const DeleteVisitedPlaceSchema = z.object({
  tripId: z.string().min(1),
  visitedPlaceId: z.string().min(1),
});

export const AddMediaToPlaceSchema = z.object({
  tripId: z.string().min(1),
  visitedPlaceId: z.string().min(1),
  url: z.string().url(),
  type: MediaTypeSchema,
});

export const ToggleVisitedUserSchema = z.object({
  tripId: z.string().min(1),
  visitedPlaceId: z.string().min(1),
  userId: z.string().min(1),
});

export const RatePlaceSchema = z.object({
  tripId: z.string().min(1),
  visitedPlaceId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  wouldRecommend: z.boolean().optional(),
});
