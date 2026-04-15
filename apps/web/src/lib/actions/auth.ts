"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { LoginUserSchema, RegisterUserSchema, UpdateProfileSchema } from "@/lib/validations/auth";

export async function registerUserAction(input: unknown) {
  const parsed = RegisterUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  return { ok: false as const, error: "Signup is handled by Clerk." };
}

export async function loginUserAction(input: unknown) {
  const parsed = LoginUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  return { ok: false as const, error: "Login is handled by Clerk." };
}

export async function logoutUserAction() {
  return { ok: true as const };
}

export async function getCurrentUserAction() {
  const user = await getCurrentUser();
  return { ok: true as const, data: user };
}

export async function updateCurrentUserProfileAction(input: unknown) {
  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Unauthorized." };

  const payload = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });
  if (existing && existing.id !== user.id) {
    return { ok: false as const, error: "Email is already used by another account." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: payload.name,
      email: payload.email,
      avatar: payload.avatar || null,
      ...(payload.password ? { password: await bcrypt.hash(payload.password, 12) } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true as const };
}
