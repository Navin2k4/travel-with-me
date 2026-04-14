import { SignupForm } from "@/components/auth/signup-form";
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
    <main className="relative flex min-h-[calc(100vh-56px)] w-full items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      <div className="pointer-events-none absolute top-10 right-10 h-[30vh] w-[30vh] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-[40vh] w-[40vh] rounded-full bg-accent/30 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 rounded-3xl border border-border bg-card/60 p-6 text-foreground shadow-sm backdrop-blur-2xl sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <section className="grid gap-6">
          <div className="space-y-4">
            <div className="font-heading text-4xl leading-tight font-bold tracking-tight md:text-5xl">
              Start your shared <br />
              <span className="text-primary">travel workspace</span>
            </div>
            <div className="max-w-xl rounded-2xl border border-border bg-card/80 p-5 text-lg text-muted-foreground">
              Create your account to plan trips with richer details, split spends fairly, and keep everyone coordinated.
            </div>
          </div>

          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <CalendarDotsIcon size={24} weight="fill" />
                Structured Setup
              </div>
              <p className="leading-relaxed text-muted-foreground">Add start point, dates, status, and transport details from day one.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <UsersThreeIcon size={24} weight="fill" />
                People-First
              </div>
              <p className="leading-relaxed text-muted-foreground">Add people you traveled with quickly and discover others by search.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <MoneyIcon size={24} weight="fill" />
                Accurate Settlements
              </div>
              <p className="leading-relaxed text-muted-foreground">Track who paid, preview splits, and auto-generate who owes whom.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-5 transition-transform hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-primary">
                <MapPinAreaIcon size={24} weight="fill" />
                Place Journal
              </div>
              <p className="leading-relaxed text-muted-foreground">Store visited places with media and ratings so memories stay organized.</p>
            </div>
          </div>
        </section>

        <div className="relative grid gap-4">
          <SignupForm inviteToken={params.invite} nextPath={params.next} />
          <p className="text-center text-base font-medium text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login${params.invite ? `?invite=${encodeURIComponent(params.invite)}` : ""}` as Route}
              className="text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-primary/80"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
