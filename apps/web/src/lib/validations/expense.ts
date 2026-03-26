import { z } from "zod";

const SplitTypeSchema = z.enum(["EQUAL", "EXACT_AMOUNT", "PERCENTAGE", "SHARES"]);

export const CreateExpenseSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1).max(160),
  notes: z.string().max(4000).optional(),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3).optional(),
  paidById: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1),
  splitType: SplitTypeSchema,
  splitDetails: z.record(z.string(), z.number()).optional(),
  category: z
    .enum(["FOOD", "TRANSPORT", "LODGING", "ENTERTAINMENT", "SHOPPING", "UTILITIES", "OTHER"])
    .optional(),
  recurrenceRule: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});

export const ComputeSplitSchema = z.object({
  amountMinor: z.number().int().positive(),
  splitType: SplitTypeSchema,
  participantIds: z.array(z.string().min(1)).min(1),
  splitDetails: z.record(z.string(), z.number()).optional(),
});
