import { z } from "zod";

export const CreateInviteSchema = z.object({
  tripId: z.string().min(1),
  expiresAt: z.coerce.date().optional(),
  maxUses: z.number().int().positive().optional(),
});

export const TokenSchema = z.object({
  token: z.string().min(10),
});

export const DisableInviteSchema = z.object({
  tripId: z.string().min(1),
  inviteId: z.string().min(1),
});

export const RegenerateInviteSchema = DisableInviteSchema;
