"use client";

import Link from "next/link";
import type { Route } from "next";
import { useTransition } from "react";
import { Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { requestJoinTripAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";

export function TripAccessAction({
  status,
  tripId,
  hasAccess,
  hasPendingRequest,
}: {
  status: "PLANNING" | "STARTED" | "ONGOING" | "ENDED";
  tripId: string;
  hasAccess: boolean;
  hasPendingRequest: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (hasAccess) {
    return (
      <Button asChild size="sm" className="rounded-full border border-border bg-primary text-primary-foreground hover:bg-primary/90">
        <Link href={`/trips/${tripId}` as Route}>Open</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status !== "ENDED" ? (
        <>
          <div className="relative inline-flex rounded-xl p-px">
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)] bg-size-[200%_100%] animate-borderGlow" />
            <Button
              size="sm"
              variant="default"
              className="relative rounded-xl border  border-primary/30 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              disabled={isPending || hasPendingRequest}
              onClick={() =>
                startTransition(async () => {
                  const result = await requestJoinTripAction({ tripId });
                  if (!result.ok) {
                    toast.error(typeof result.error === "string" ? result.error : "Failed to request join.");
                    return;
                  }
                  toast.success("Join request sent.");
                })
              }
            >
              <h1 className="text-primary">

              {hasPendingRequest ? "Requested" : isPending ? "Requesting..." : "Join the Crew"}
              </h1>
            </Button>
          </div>
        </>
      ) : (
        <div className="relative inline-flex rounded-xl p-px">
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)] bg-size-[200%_100%] animate-borderGlow" />
          <Link
            href={`/trips/${tripId}/story` as Route}
            target="_blank"
            className="relative flex items-center gap-2 rounded-xl border border-primary/30 bg-background/80 px-3 py-1.5 font-medium text-primary backdrop-blur-sm hover:bg-background/90"
          >
            <Share2Icon className="h-3 w-3" />
            <span className="text-xs">Story</span>
          </Link>
        </div>
      )}
    </div>
  );
}
