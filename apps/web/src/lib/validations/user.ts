import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(128),
  avatar: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
