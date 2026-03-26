import { requireUser } from "@/lib/auth/guards";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center p-4">
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        }}
      />
    </main>
  );
}
