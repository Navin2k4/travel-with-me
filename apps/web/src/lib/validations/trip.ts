import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

export const CreateTripSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional(),
  coverImage: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
  startPoint: z.string().max(160).optional(),
  dateFlexibility: z.enum(["FIXED", "MAY_CHANGE"]).optional(),
  transportMode: z.enum(["FLIGHT", "TRAIN", "BUS", "CAR", "BIKE", "SHIP", "WALK", "OTHER"]).optional(),
  transportNotes: z.string().max(4000).optional(),
  status: z.enum(["PLANNING", "STARTED", "ONGOING", "ENDED"]).optional(),
  createdById: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const AddParticipantsSchema = z.object({
  tripId: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1),
});

export const UpdateTripSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional(),
  coverImage: z.preprocess(emptyStringToUndefined, z.string().url().nullable().optional()),
  startPoint: z.string().max(160).optional(),
  dateFlexibility: z.enum(["FIXED", "MAY_CHANGE"]).optional(),
  transportMode: z.enum(["FLIGHT", "TRAIN", "BUS", "CAR", "BIKE", "SHIP", "WALK", "OTHER"]).nullable().optional(),
  transportNotes: z.string().max(4000).optional(),
  status: z.enum(["PLANNING", "STARTED", "ONGOING", "ENDED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const UpdateTripCoverImageSchema = z.object({
  tripId: z.string().min(1),
  coverImage: z.string().url(),
});

export const RequestJoinTripSchema = z.object({
  tripId: z.string().min(1),
});

export const ReviewJoinRequestSchema = z.object({
  tripId: z.string().min(1),
  requestId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
});

export const AssignParticipantTagSchema = z.object({
  tripId: z.string().min(1),
  userId: z.string().min(1),
  customLabel: z.string().trim().min(1).max(60),
});

export type CreateTripInput = z.infer<typeof CreateTripSchema>;
