"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CreateUserSchema } from "@/lib/validations/user";

export async function createUserAction(input: unknown) {
  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await bcrypt.hash(parsed.data.password, 12),
      avatar: parsed.data.avatar || null,
    },
  });

  revalidatePath("/");
  return { ok: true as const, data: user };
}
