import { z } from "zod";

const SplitTypeSchema = z.enum(["EQUAL", "EXACT_AMOUNT", "PERCENTAGE", "SHARES"]);

export const CreateExpenseSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1).max(160),
  notes: z.string().max(4000).optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  paidById: z.string().min(1),
  paymentMode: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "WALLET", "OTHER"]).optional(),
  participantIds: z.array(z.string().min(1)).min(1),
  splitType: SplitTypeSchema,
  splitDetails: z.record(z.string(), z.number()).optional(),
  category: z
    .enum([
      "FOOD",
      "TRANSPORT",
      "FUEL",
      "TOLL_PARKING",
      "LODGING",
      "FLIGHT",
      "TRAIN_BUS",
      "LOCAL_TRAVEL",
      "VISA",
      "INSURANCE",
      "ACTIVITY_TICKETS",
      "GUIDE_TIPS",
      "MEDICAL",
      "COMMUNICATION",
      "ENTERTAINMENT",
      "SHOPPING",
      "UTILITIES",
      "OTHER",
    ])
    .optional(),
  customCategory: z.string().trim().max(60).optional(),
  recurrenceRule: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});

export const UpdateExpenseSchema = z.object({
  expenseId: z.string().min(1),
  tripId: z.string().min(1),
  title: z.string().min(1).max(160),
  notes: z.string().max(4000).optional(),
  paidById: z.string().min(1),
  paymentMode: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "WALLET", "OTHER"]),
  category: z.enum([
    "FOOD",
    "TRANSPORT",
    "FUEL",
    "TOLL_PARKING",
    "LODGING",
    "FLIGHT",
    "TRAIN_BUS",
    "LOCAL_TRAVEL",
    "VISA",
    "INSURANCE",
    "ACTIVITY_TICKETS",
    "GUIDE_TIPS",
    "MEDICAL",
    "COMMUNICATION",
    "ENTERTAINMENT",
    "SHOPPING",
    "UTILITIES",
    "OTHER",
  ]),
  customCategory: z.string().trim().max(60).optional(),
});

export const DeleteExpenseSchema = z.object({
  expenseId: z.string().min(1),
  tripId: z.string().min(1),
});

export const SettleSettlementSchema = z.object({
  settlementId: z.string().min(1),
  tripId: z.string().min(1),
});

export const ComputeSplitSchema = z.object({
  amount: z.number().positive(),
  splitType: SplitTypeSchema,
  participantIds: z.array(z.string().min(1)).min(1),
  splitDetails: z.record(z.string(), z.number()).optional(),
});
