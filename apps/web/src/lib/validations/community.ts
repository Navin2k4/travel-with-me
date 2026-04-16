import { z } from "zod";

export const CreateCommunityThreadSchema = z.object({
  tripId: z.string().min(1),
  body: z.string().trim().min(3).max(4000),
});

export const CreateCommunityMessageSchema = z.object({
  tripId: z.string().min(1),
  threadId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
  parentId: z.string().min(1).optional(),
});

export const VoteCommunityThreadSchema = z.object({
  tripId: z.string().min(1),
  threadId: z.string().min(1),
  vote: z.enum(["UP", "DOWN", "NONE"]),
});

export const EditCommunityThreadSchema = z.object({
  tripId: z.string().min(1),
  threadId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

export const DeleteCommunityThreadSchema = z.object({
  tripId: z.string().min(1),
  threadId: z.string().min(1),
});

export const EditCommunityMessageSchema = z.object({
  tripId: z.string().min(1),
  threadId: z.string().min(1),
  messageId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
});

export const DeleteCommunityMessageSchema = z.object({
  tripId: z.string().min(1),
  threadId: z.string().min(1),
  messageId: z.string().min(1),
});
