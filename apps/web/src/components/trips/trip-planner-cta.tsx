import Link from "next/link";
import { ArrowSquareOut, MapTrifold } from "@phosphor-icons/react/dist/ssr";

type TripPlannerCtaProps = {
  tripId: string;
};

export function TripPlannerCta({ tripId }: TripPlannerCtaProps) {
  return (
    <Link
      href={`/trips/${tripId}/planner`}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group inline-flex items-center gap-2 rounded-xl p-[1px]"
    >
      {/* Animated Border Layer */}
      <span className="absolute inset-0 rounded-xl bg-[linear-gradient(90deg,transparent,theme(colors.primary),transparent)] bg-[length:200%_100%] animate-borderGlow" />

      {/* Actual Content */}
      <span className="relative inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-background/80 px-3 py-2 backdrop-blur-sm transition-colors ">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MapTrifold className="h-4 w-4" weight="duotone" />
        </span>

        <span className="grid leading-tight">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Open Planner
          </span>
          <span className="text-[11px] text-muted-foreground">
            Plan your trip in new tab
          </span>
        </span>

        <ArrowSquareOut className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </span>
    </Link>
  );
}
