import { SignupForm } from "@/components/auth/signup-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import type { Route } from "next";
import Image from "next/image";
import { CalendarDotsIcon, MapPinAreaIcon, MoneyIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import brandText from "@/travelwithmetext.png";

type Props = {
  searchParams: Promise<{ invite?: string; next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect((params.next || "/") as Route);
  return (
    <main className="mx-auto grid min-h-[calc(100vh-56px)] w-full max-w-6xl items-center gap-6 p-4 lg:grid-cols-[1.35fr_1fr]">
      <section className="grid gap-4">
      <div className="overflow-hidden border-muted/60 bg-linear-to-br from-background via-muted/40 to-background">
        <div>
          <Image src={brandText} alt="Travel With Me" className="h-16 w-auto object-contain" priority />
          <div className="text-3xl py-2 leading-tight">Start your shared travel workspace in minutes</div>
          <div className="py-4">
            Create your account to plan trips with richer details, split spends fairly, and keep everyone coordinated.
          </div>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border bg-background/70 p-3">
            <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
              <CalendarDotsIcon size={16} />
              Structured Trip Setup
            </div>
            <p className="text-muted-foreground">Add start point, dates, status, and transport details from day one.</p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
              <UsersThreeIcon size={16} />
              People-First Collaboration
            </div>
            <p className="text-muted-foreground">Add people you already traveled with quickly and discover others by search.</p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
              <MoneyIcon size={16} />
              Accurate Settlements
            </div>
            <p className="text-muted-foreground">Track who paid, preview splits, and auto-generate who owes whom.</p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
              <MapPinAreaIcon size={16} />
              Place-by-Place Journal
            </div>
            <p className="text-muted-foreground">Store visited places with media and ratings so memories stay organized.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1. Create or join a trip</strong> with invite links and request approvals.</p>
          <p><strong className="text-foreground">2. Add participants & expenses</strong> with flexible split rules.</p>
          <p><strong className="text-foreground">3. Track places and finalize settlements</strong> in one workflow.</p>
        </CardContent>
      </Card>
      </section>

      <div className="grid gap-3">
        <SignupForm inviteToken={params.invite} nextPath={params.next} />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/login${params.invite ? `?invite=${encodeURIComponent(params.invite)}` : ""}` as Route}
            className="underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
