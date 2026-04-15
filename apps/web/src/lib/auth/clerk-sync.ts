import { prisma } from "@/lib/prisma";

type SyncableClerkUser = {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_addresses?: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id?: string | null;
};

function pickPrimaryEmail(user: SyncableClerkUser) {
  const primary =
    user.email_addresses?.find(
      (email) => email.id === user.primary_email_address_id
    )?.email_address ?? user.email_addresses?.[0]?.email_address;

  return primary?.trim().toLowerCase() || null;
}

function getDisplayName(user: SyncableClerkUser, email: string) {
  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  if (fullName) return fullName;
  if (user.username?.trim()) return user.username.trim();
  return email.split("@")[0] || "Traveler";
}

export async function upsertUserFromClerk(user: SyncableClerkUser) {
  const email = pickPrimaryEmail(user);
  if (!email) {
    return null;
  }

  const name = getDisplayName(user, email);
  const avatar = user.image_url ?? null;

  return prisma.user.upsert({
    where: { email },
    update: {
      clerkId: user.id,
      name,
      avatar,
    },
    create: {
      clerkId: user.id,
      email,
      name,
      avatar,
      // Local schema still requires a password field.
      password: `clerk:${user.id}`,
    },
  });
}

export async function deleteUserFromClerk(clerkId: string) {
  await prisma.user.deleteMany({
    where: { clerkId },
  });
}
