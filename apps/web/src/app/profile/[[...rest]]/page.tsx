import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <UserProfile routing="path" path="/profile" />
    </main>
  );
}
