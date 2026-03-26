import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInviteAction, validateInviteAction } from "@/lib/actions/invites";
import { getCurrentUser } from "@/lib/auth/session";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const validation = await validateInviteAction({ token });
  const currentUser = await getCurrentUser();

  if (!validation.ok) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invite Invalid</CardTitle>
            <CardDescription>This invite is {String(validation.error)}.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  async function joinTrip() {
    "use server";
    const result = await acceptInviteAction({ token });
    if (!result.ok) return;
    redirect(`/trips/${result.data.tripId}` as Route);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Trip Invite</CardTitle>
          <CardDescription>
            You are invited to join <b>{validation.data.tripTitle}</b> by {validation.data.createdByName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {currentUser ? (
            <form action={joinTrip}>
              <Button type="submit">Join Trip</Button>
            </form>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link href={`/login?invite=${encodeURIComponent(token)}&next=${encodeURIComponent(`/invite/${token}`)}` as Route}>
                <Button>Login to continue</Button>
              </Link>
              <Link href={`/signup?invite=${encodeURIComponent(token)}&next=${encodeURIComponent(`/invite/${token}`)}` as Route}>
                <Button variant="outline">Sign up</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
