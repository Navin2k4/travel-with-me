import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { upsertUserFromClerk } from "@/lib/auth/clerk-sync";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (existing) {
    return existing;
  }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId).catch(() => null);
  if (!clerkUser) {
    return null;
  }

  return upsertUserFromClerk({
    id: userId,
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    username: clerkUser.username,
    image_url: clerkUser.imageUrl,
    email_addresses: clerkUser.emailAddresses.map((entry) => ({
      id: entry.id,
      email_address: entry.emailAddress,
    })),
    primary_email_address_id: clerkUser.primaryEmailAddressId,
  });
}
