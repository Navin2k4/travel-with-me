import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import Image from "next/image";
import { CalendarDotsIcon, MapPinAreaIcon, MoneyIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
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
    <main className="relative flex min-h-[calc(100vh-56px)] w-full items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      <div className="pointer-events-none absolute top-10 right-10 h-[30vh] w-[30vh] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-[40vh] w-[40vh] rounded-full bg-accent/30 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 rounded-3xl border border-border bg-card/60 p-6 text-foreground shadow-sm backdrop-blur-2xl sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <section className="grid gap-6">
          <div className="space-y-4">
            <div className="font-heading text-4xl leading-tight font-bold tracking-tight md:text-5xl">
              Welcome back to your <br /><span className="text-primary">travel workspace</span>
            </div>
            <div className="max-w-xl rounded-2xl border border-border bg-card/80 p-5 text-lg text-muted-foreground">
              Continue planning trips, tracking group expenses, and documenting places together.
            </div>
          </div>
          
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <CalendarDotsIcon size={24} weight="fill" />
                Trip Lifecycle
              </div>
              <p className="leading-relaxed text-muted-foreground">Move trips from planning to started, ongoing, and ended with clear visibility.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <MoneyIcon size={24} weight="fill" />
                Expense Engine
              </div>
              <p className="leading-relaxed text-muted-foreground">Split by equal, exact amount, percentage, or shares and preview before saving.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <MapPinAreaIcon size={24} weight="fill" />
                Visited Places
              </div>
              <p className="leading-relaxed text-muted-foreground">Capture photos, notes, and ratings per person for each place in your timeline.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <UsersThreeIcon size={24} weight="fill" />
                Safe Collaboration
              </div>
              <p className="leading-relaxed text-muted-foreground">Use invite links, join requests, and creator approval to control access.</p>
            </div>
          </div>
        </section>

        <div className="relative grid gap-4">
          <LoginForm inviteToken={params.invite} nextPath={params.next} />
          <p className="text-center text-base font-medium text-muted-foreground">
            New here?{" "}
            <Link
              href={`/signup${params.invite ? `?invite=${encodeURIComponent(params.invite)}` : ""}` as Route}
              className="text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-primary/80"
            >
              Create an account
            </Link>
          </p>
        </div>
        
      </div>
    </main>
  );
}
