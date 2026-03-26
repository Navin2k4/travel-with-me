"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { createSession, clearSession, getCurrentUser } from "@/lib/auth/session";
import { acceptInviteForUser } from "@/lib/auth/invite-core";
import { prisma } from "@/lib/prisma";
import { LoginUserSchema, RegisterUserSchema, UpdateProfileSchema } from "@/lib/validations/auth";

export async function registerUserAction(input: unknown) {
  const parsed = RegisterUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const payload = parsed.data;
  try {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) return { ok: false as const, error: "Email already in use." };

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        avatar: payload.avatar ?? null,
      },
    });

    await createSession(user.id);

    if (payload.inviteToken) {
      const joined = await acceptInviteForUser(payload.inviteToken, user.id);
      if (joined.ok) {
        return { ok: true as const, data: { userId: user.id, redirectTo: `/trips/${joined.tripId}` } };
      }
    }

    revalidatePath("/");
    return { ok: true as const, data: { userId: user.id, redirectTo: "/" } };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to register." };
  }
}

export async function loginUserAction(input: unknown) {
  const parsed = LoginUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };
  const payload = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) return { ok: false as const, error: "Invalid credentials." };

    const isValid = await bcrypt.compare(payload.password, user.password);
    if (!isValid) return { ok: false as const, error: "Invalid credentials." };

    await createSession(user.id);

    if (payload.inviteToken) {
      const joined = await acceptInviteForUser(payload.inviteToken, user.id);
      if (joined.ok) {
        return { ok: true as const, data: { redirectTo: `/trips/${joined.tripId}` } };
      }
    }

    return { ok: true as const, data: { redirectTo: "/" } };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Failed to login." };
  }
}

export async function logoutUserAction() {
  await clearSession();
  redirect("/login" as Route);
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
