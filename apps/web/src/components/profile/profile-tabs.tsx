"use client";

import Link from "next/link";
import type { Route } from "next";
import { CalendarDotsIcon, FlagPennantIcon, PathIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { Share2Icon } from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";
import { TripWishlistButton } from "@/components/trips/trip-wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_IMAGE_PLACEHOLDER_URL, DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { UserProfile } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

type WishlistTrip = {
  id: string;
  title: string;
  coverImage: string | null;
  status: "PLANNING" | "STARTED" | "ONGOING" | "ENDED";
  dateFlexibility: "FIXED" | "MAY_CHANGE";
  startDate: string | null;
  endDate: string | null;
  startPoint: string | null;
  transportMode: string | null;
  participantsCount: number;
  hasAccess: boolean;
};

type CrewMate = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  tripsTogether: number;
};

export function ProfileTabs({
  account,
  wishlistTrips,
  pastCrews,
}: {
  account: { name: string; email: string; avatar: string | null };
  wishlistTrips: WishlistTrip[];
  pastCrews: CrewMate[];
}) {
  const getStatusClassName = (status: WishlistTrip["status"]) => {
    if (status === "PLANNING") return "bg-primary/15 text-primary border-primary/30";
    if (status === "STARTED") return "bg-primary/25 text-primary border-primary/30";
    if (status === "ONGOING") return "bg-primary/35 text-primary-foreground border-primary/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <Tabs defaultValue="account" className="w-full gap-4">
      <TabsList className="h-auto w-full justify-start " variant="line">
        <TabsTrigger value="account" className="px-3 py-2 text-sm">
          Account
        </TabsTrigger>
        <TabsTrigger value="wishlist" className="px-3 py-2 text-sm">
          Wishlists
        </TabsTrigger>
        <TabsTrigger value="crews" className="px-3 py-2 text-sm">
          Your Past Crews
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="pt-2 flex justify-center items-center">
        <UserProfile
          appearance={{
            theme: shadcn
          }}
        />
      </TabsContent>

      <TabsContent value="wishlist" className="pt-2">
        {wishlistTrips.length === 0 ? (
          <div className="rounded-xl border border-dashed flex items-center justify-center border-border p-6 text-sm text-muted-foreground">
            No trips in wishlist yet. Add trips from the dashboard using the heart icon.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {wishlistTrips.map((trip) => (
              <div key={trip.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={trip.coverImage || DEFAULT_IMAGE_PLACEHOLDER_URL}
                  alt={`${trip.title} cover`}
                  className="h-52 w-full object-cover brightness-110 transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-linear-to-tl from-background/95 via-background/60 to-transparent" />
                <div className="absolute inset-0 p-4">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`rounded-full border px-2.5 py-1 font-medium backdrop-blur-sm ${getStatusClassName(trip.status)}`}
                        >
                          {trip.status}
                        </span>
                        <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-card-foreground backdrop-blur-sm">
                          {trip.dateFlexibility === "MAY_CHANGE" ? "Dates may change" : "Dates fixed"}
                        </span>
                      </div>
                      <TripWishlistButton tripId={trip.id} initialWishlisted />
                    </div>

                    <div className="max-w-3xl">
                      <h3 className="text-xl font-semibold leading-tight text-foreground">
                        {trip.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/90">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDotsIcon size={14} className="text-primary" />
                          {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "-"} to{" "}
                          {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "-"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <UsersThreeIcon size={14} className="text-primary" />
                          {trip.participantsCount} participants
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FlagPennantIcon size={13} className="text-primary" />
                          {trip.startPoint || "Start point not set"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <PathIcon size={13} className="text-primary" />
                          {trip.transportMode || "Transport not set"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {trip.status === "ENDED" ? (
                          <Link
                            href={`/trips/${trip.id}/story` as Route}
                            target="_blank"
                            className="flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1.5 font-medium text-primary backdrop-blur-sm"
                          >
                            <Share2Icon className="h-4 w-4" />
                            <span className="text-xs">Story</span>
                          </Link>
                        ) : (
                          <Link
                            href={(trip.hasAccess ? `/trips/${trip.id}` : `/invite`) as Route}
                            className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm"
                          >
                            {trip.hasAccess ? "Open Trip" : "Request Access"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="crews" className="pt-2">
        {pastCrews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No past crew members yet. Join or create trips to build your crew history.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pastCrews.map((member) => (
              <div key={member.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar || DEFAULT_USER_AVATAR_URL}
                    alt={member.name}
                    className="h-12 w-12 rounded-full border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant="secondary">{member.tripsTogether} trips</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
