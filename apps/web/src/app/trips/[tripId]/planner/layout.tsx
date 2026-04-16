import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type PlannerLayoutProps = {
  children: ReactNode;
  params: Promise<{ tripId: string }>;
};

export default async function PlannerLayout({ children, params }: PlannerLayoutProps) {
  const { tripId } = await params;
  const user = await requireUser(`/trips/${tripId}/planner`);

  const membership = await prisma.tripParticipant.findUnique({
    where: {
      tripId_userId: {
        tripId,
        userId: user.id,
      },
    },
    select: { isActive: true },
  });

  if (!membership?.isActive) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4">
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          You do not have access to this trip planner.
        </div>
      </main>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 p-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-sm font-medium text-foreground">Trip Planner Workspace</p>
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to trip
        </Link>
      </div>
      {children}
    </div>
  );
}
