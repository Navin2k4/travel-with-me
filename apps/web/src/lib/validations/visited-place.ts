import { z } from "zod";

export const PlaceCategorySchema = z.enum(["ATTRACTION", "FOOD", "STAY", "SHOPPING", "OTHER"]);
export const MediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);

export const CreateVisitedPlaceSchema = z.object({
  tripId: z.string().min(1),
  name: z.string().trim().min(1).max(160),
  category: PlaceCategorySchema.default("OTHER"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().trim().max(500).optional(),
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
