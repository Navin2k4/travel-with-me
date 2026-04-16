"use client";

import { InfoIcon } from "@phosphor-icons/react";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DEFAULT_IMAGE_PLACEHOLDER_URL, DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import type { Route } from "next";
import { TripAccessAction } from "./trip-access-action";
import { MessageCircleIcon, Share2Icon } from "lucide-react";

type TripInfo = {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: "PLANNING" | "STARTED" | "ONGOING" | "ENDED";
  startPoint: string | null;
  dateFlexibility: "FIXED" | "MAY_CHANGE";
  transportMode: "FLIGHT" | "TRAIN" | "BUS" | "CAR" | "BIKE" | "SHIP" | "WALK" | "OTHER" | null;
  transportNotes: string | null;
  startDate: string | null;
  endDate: string | null;
  hasAccess: boolean;
  hasPendingRequest: boolean;
  crews: Array<{ id: string; name: string; avatar: string | null }>;
  counts: {
    participants: number;
    expenses: number;
    visitedPlaces: number;
    communityThreads: number;
  };
};

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Invalid date";
  return parsed.toLocaleString();
}

export function TripInfoDrawer({ trip }: { trip: TripInfo }) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          size="icon-sm"
          variant="secondary"
          className="h-8 w-8 rounded-full border border-border bg-card/80 hover:bg-card"
          aria-label="Open trip information"
          title="Open trip information"
        >
          <InfoIcon className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-xl">
        <ScrollArea className="max-h-[90vh]">

          <div className="relative h-44 w-full">
            <Image
              src={trip.coverImage || DEFAULT_IMAGE_PLACEHOLDER_URL}
              alt={`${trip.title} cover`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 to-black/35" />
            <div className="absolute inset-0 flex items-end p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{trip.status}</p>
                <h2 className="text-xl font-semibold text-primary">{trip.title}</h2>
              </div>
            </div>
          </div>
          <DrawerHeader>
            <DrawerTitle>Trip Overview</DrawerTitle>
            <DrawerDescription>Useful details about this journey</DrawerDescription>
          </DrawerHeader>

          <div className="grid gap-4 px-4 pb-4 text-sm">
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">About this trip</p>
              <p>{trip.description || "No description provided."}</p>
            </div>

            <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan Details</p>
              <p><span className="text-muted-foreground">Date range:</span> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
              <p><span className="text-muted-foreground">Starting point:</span> {trip.startPoint || "Not set"}</p>
              <p><span className="text-muted-foreground">Date plan:</span> {trip.dateFlexibility === "MAY_CHANGE" ? "Flexible dates" : "Fixed dates"}</p>
              <p><span className="text-muted-foreground">Transport:</span> {trip.transportMode || "Not set"}</p>
              <p><span className="text-muted-foreground">Transport notes:</span> {trip.transportNotes || "No additional notes"}</p>
            </div>

            <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trip Activity</p>
              <p><span className="text-muted-foreground">Participants:</span> {trip.counts.participants}</p>
              <p><span className="text-muted-foreground">Expenses:</span> {trip.counts.expenses}</p>
              <p><span className="text-muted-foreground">Visited Places:</span> {trip.counts.visitedPlaces}</p>
              <p><span className="text-muted-foreground">Community Threads:</span> {trip.counts.communityThreads}</p>
            </div>

            <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Crew</p>
              <div className="flex flex-wrap gap-2">
                {trip.crews.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No crew members listed yet.</p>
                ) : (
                  trip.crews.map((crew) => (
                    <div key={crew.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-2.5 py-1">
                      <img
                        src={crew.avatar || DEFAULT_USER_AVATAR_URL}
                        alt={crew.name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium">{crew.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </ScrollArea>
        <DrawerFooter className="border-t border-border/70 bg-background/80">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="relative inline-flex rounded-xl p-px">
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)] bg-size-[200%_100%] animate-borderGlow" />
              <Link
                href={`/trips/${trip.id}/story` as Route}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-background/80 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm hover:bg-background/90"
              >
                <Share2Icon className="h-3 w-3" />
                Story
              </Link>
            </div>
            <div className="relative inline-flex rounded-xl p-px">
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)] bg-size-[200%_100%] animate-borderGlow" />
              <Link
                href={`/trips/${trip.id}/community` as Route}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-background/80 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm hover:bg-background/90"
              >
                <MessageCircleIcon className="h-3 w-3" />
                Community
              </Link>
            </div>
            {trip.status !== "ENDED" && (
              <TripAccessAction
                status={trip.status}
                tripId={trip.id}
                hasAccess={trip.hasAccess}
                hasPendingRequest={trip.hasPendingRequest}
              />
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
