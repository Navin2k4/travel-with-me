import { UserProfile } from "@clerk/nextjs";
import { requireUser } from "@/lib/auth/guards";

export default async function ProfilePage() {
  await requireUser("/profile");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <UserProfile />
    </main>
  );
}
