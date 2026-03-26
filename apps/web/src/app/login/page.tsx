import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import Image from "next/image";
import { CalendarDotsIcon, MapPinAreaIcon, MoneyIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import brandText from "@/travelwithmetext.png";

type Props = {
  searchParams: Promise<{ invite?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect((params.next || "/") as Route);
  return (
    <main className="mx-auto grid min-h-[calc(100vh-56px)] w-full max-w-6xl items-center gap-6 p-4 lg:grid-cols-[1.35fr_1fr]">
      <section className="grid gap-4">
        <div className="overflow-hidden border-muted/60 bg-linear-to-br from-background via-muted/40 to-background">
          <div className="space-y-3">
            <Image src={brandText} alt="Travel With Me" className="h-16 w-auto object-contain" priority />
            <div className="text-3xl leading-tight">One place to plan, track, and settle group travel</div>
            <div className="max-w-2xl py-4">
              Continue your trip workspace with live status tracking, smarter split calculations, and place-based memories.
            </div>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg border bg-background/70 p-3">
              <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
                <CalendarDotsIcon size={16} />
                Trip Lifecycle
              </div>
              <p className="text-muted-foreground">Move trips from planning to started, ongoing, and ended with clear visibility.</p>
            </div>
            <div className="rounded-lg border bg-background/70 p-3">
              <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
                <MoneyIcon size={16} />
                Expense Engine
              </div>
              <p className="text-muted-foreground">Split by equal, exact amount, percentage, or shares and preview before saving.</p>
            </div>
            <div className="rounded-lg border bg-background/70 p-3">
              <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
                <MapPinAreaIcon size={16} />
                Visited Places
              </div>
              <p className="text-muted-foreground">Capture photos, notes, and ratings per person for each place in your timeline.</p>
            </div>
            <div className="rounded-lg border bg-background/70 p-3">
              <div className="mb-1 inline-flex items-center gap-1.5 font-medium">
                <UsersThreeIcon size={16} />
                Safe Collaboration
              </div>
              <p className="text-muted-foreground">Use invite links, join requests, and creator approval to control trip access.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Before trip:</strong> decide dates, transport, and participants with less confusion.</p>
            <p><strong className="text-foreground">During trip:</strong> add spends and places quickly while everyone stays in sync.</p>
            <p><strong className="text-foreground">After trip:</strong> settle balances and keep a clean memory log of where you went.</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-3">
        <LoginForm inviteToken={params.invite} nextPath={params.next} />
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href={`/signup${params.invite ? `?invite=${encodeURIComponent(params.invite)}` : ""}` as Route}
            className="underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
