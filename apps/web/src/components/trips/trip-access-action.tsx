"use client";

import Link from "next/link";
import type { Route } from "next";
import { useTransition } from "react";
import { toast } from "sonner";
import { requestJoinTripAction } from "@/lib/actions/trips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TripAccessAction({
  tripId,
  hasAccess,
  hasPendingRequest,
}: {
  tripId: string;
  hasAccess: boolean;
  hasPendingRequest: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (hasAccess) {
    return (
      <Button asChild size="sm">
        <Link href={`/trips/${tripId}` as Route}>Open</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="p-3">No Access</Badge>
      <Button
        size="sm"
        variant="default"
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
        {hasPendingRequest ? "Requested" : isPending ? "Requesting..." : "Request Join"}
      </Button>
    </div>
  );
}
