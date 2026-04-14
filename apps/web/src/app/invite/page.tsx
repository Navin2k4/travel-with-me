import { InviteTokenForm } from "@/components/invite/invite-token-form";

export default function InviteLandingPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-56px)] w-full items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute top-10 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 bottom-10 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card/90 p-8 text-center shadow-sm backdrop-blur-xl sm:p-12">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Join Trip</h2>
        <p className="mt-2 mb-8 inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium uppercase tracking-wider text-primary">
          Enter token to join
        </p>

        <InviteTokenForm />
      </div>
    </main>
  );
}