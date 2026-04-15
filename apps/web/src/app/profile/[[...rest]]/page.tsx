import { UserProfile } from "@clerk/nextjs";
import { requireUser } from "@/lib/auth/guards";

export default async function ProfilePage() {
  await requireUser("/profile");

  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <UserProfile routing="path" path="/profile" />
    </main>
  );
}
