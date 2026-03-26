import { z } from "zod";

export const RegisterUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(128),
  avatar: z.string().url().optional(),
  inviteToken: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  inviteToken: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  avatar: z.string().url().optional().or(z.literal("")),
  password: z.string().min(8).max(128).optional().or(z.literal("")),
});
