"use client";

import { HeartIcon } from "@phosphor-icons/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleTripWishlistAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";

export function TripWishlistButton({
  tripId,
  initialWishlisted,
}: {
  tripId: string;
  initialWishlisted: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="h-8 w-8 rounded-full border border-border bg-card/80 hover:bg-card"
      onClick={() =>
        startTransition(async () => {
          const result = await toggleTripWishlistAction({ tripId });
          if (!result.ok) {
            toast.error(typeof result.error === "string" ? result.error : "Failed to update wishlist.");
            return;
          }
          setWishlisted(result.data.wishlisted);
          toast.success(result.data.wishlisted ? "Added to wishlist." : "Removed from wishlist.");
        })
      }
    >
      <HeartIcon
        className={`h-4 w-4 ${wishlisted ? "text-red-500" : "text-muted-foreground"}`}
        weight={wishlisted ? "fill" : "regular"}
      />
    </Button>
  );
}
