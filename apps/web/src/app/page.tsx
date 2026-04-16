import { CreateTripDialog } from "@/components/trips/create-trip-dialog";
import { TripAccessAction } from "@/components/trips/trip-access-action";
import { TripInfoDrawer } from "@/components/trips/trip-info-drawer";
import { TripWishlistButton } from "@/components/trips/trip-wishlist-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDotsIcon,
  ChatCircleDotsIcon,
  FlagPennantIcon,
  PathIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_IMAGE_PLACEHOLDER_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { Route } from "next";
import Link from "next/link";

export default async function Home() {
  await requireUser("/");
  const currentUser = await getCurrentUser();
  if (!currentUser) return <main className="p-4">Please log in to continue.</main>;

  const [users, trips, myTripMemberships, wishlistedTripRows] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.trip.findMany({
      include: {
        participants: { select: { userId: true, isActive: true, user: { select: { id: true, name: true, avatar: true } } } },
        joinRequests: {
          where: { requesterId: currentUser.id, status: "PENDING" },
          select: { id: true },
        },
        _count: {
          select: {
            participants: true,
            expenses: true,
            visitedPlaces: true,
            communityThreads: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tripParticipant.findMany({
      where: { userId: currentUser.id, isActive: true },
      select: { tripId: true },
    }),
    prisma.tripWishlist.findMany({
      where: { userId: currentUser.id },
      select: { tripId: true },
    }),
  ]);

  const myTripIds = myTripMemberships.map((m) => m.tripId);
  const coParticipants = myTripIds.length
    ? await prisma.tripParticipant.findMany({
      where: {
        tripId: { in: myTripIds },
        userId: { not: currentUser.id },
        isActive: true,
      },
      select: { userId: true },
      distinct: ["userId"],
    })
    : [];
  const plannedWithUserIds = new Set(coParticipants.map((row) => row.userId));
  const wishlistedTripIds = new Set(wishlistedTripRows.map((row) => row.tripId));
  const getStatusClassName = (status: "PLANNING" | "STARTED" | "ONGOING" | "ENDED") => {
    if (status === "PLANNING") return "bg-primary/15 text-primary border-primary/30";
    if (status === "STARTED") return "bg-primary/25 text-primary border-primary/30";
    if (status === "ONGOING") return "bg-primary/35 text-primary-foreground border-primary/30";
    return "bg-muted text-muted-foreground border-border";
  };
  const getRandomizedKnownPeople = (
    participants: Array<{ userId: string; isActive: boolean; user: { name: string } }>,
  ) => {
    const names = participants
      .filter((participant) => participant.isActive && participant.userId !== currentUser.id)
      .map((participant) => participant.user.name);
    return [...names].sort(() => Math.random() - 0.5);
  };

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 p-4">
      <section className="min-h-screen">
        <div className="">
          <div className="flex items-center p-4 rounded-xl border border-primary/20 mb-4 bg-primary/10 backdrop-blur-sm justify-between">
            <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              Every great journey starts with the right crew
            </h1>
            <CreateTripDialog
              currentUser={{
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
              }}
              users={users
                .map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  hasTripHistory: plannedWithUserIds.has(u.id),
                }))
                .filter((u) => u.id !== currentUser.id)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3  gap-3">
            {trips.length === 0 ? (
              <div className="rounded border border-dashed p-6 text-sm text-muted-foreground">
                No trips yet. Create your first trip from the panel.
              </div>
            ) : (
              trips.map((trip) => {
                const hasAccess = trip.participants.some(
                  (participant) => participant.userId === currentUser.id && participant.isActive,
                );

                return (
                  <div key={trip.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                    <img
                      src={trip.coverImage || DEFAULT_IMAGE_PLACEHOLDER_URL}
                      alt={`${trip.title} cover`}
                      className="h-64 w-full object-cover brightness-110 transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-linear-to-tl from-background/95 via-background/60 to-transparent" />
                    <div className="absolute inset-0 md:w-3/5 bg-linear-to-r from-background/92 via-background/70 to-transparent" />

                    <div className="absolute inset-0 p-4 md:p-5">
                      <div className="flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          {trip.status === "ENDED" ? (
                            <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-card-foreground backdrop-blur-sm text-xs">
                            Trip Ended
                          </span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className={`rounded-full border px-2.5 py-1 font-medium backdrop-blur-sm ${getStatusClassName(trip.status)}`}>
                                {trip.status}
                              </span>
                              <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-card-foreground backdrop-blur-sm">
                                {trip.dateFlexibility === "MAY_CHANGE" ? "Dates may change" : "Dates fixed"}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <TripWishlistButton
                              tripId={trip.id}
                              initialWishlisted={wishlistedTripIds.has(trip.id)}
                            />
                            <Link
                              href={`/trips/${trip.id}/community` as Route}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground"
                              aria-label="Open community page"
                              title="Open community page"
                            >
                              <ChatCircleDotsIcon size={16} weight="bold" />
                            </Link>
                            <TripInfoDrawer
                              trip={{
                                id: trip.id,
                                title: trip.title,
                                description: trip.description,
                                coverImage: trip.coverImage,
                                status: trip.status,
                                startPoint: trip.startPoint,
                                dateFlexibility: trip.dateFlexibility,
                                transportMode: trip.transportMode,
                                transportNotes: trip.transportNotes,
                                startDate: trip.startDate ? trip.startDate.toISOString() : null,
                                endDate: trip.endDate ? trip.endDate.toISOString() : null,
                                hasAccess,
                                hasPendingRequest: trip.joinRequests.length > 0,
                                crews: trip.participants
                                  .filter((participant) => participant.isActive)
                                  .map((participant) => ({
                                    id: participant.user.id,
                                    name: participant.user.name,
                                    avatar: participant.user.avatar,
                                  })),
                                counts: {
                                  participants: trip._count.participants,
                                  expenses: trip._count.expenses,
                                  visitedPlaces: trip._count.visitedPlaces,
                                  communityThreads: trip._count.communityThreads,
                                },
                              }}
                            />
                            <TripAccessAction
                              status={trip.status}
                              tripId={trip.id}
                              hasAccess={hasAccess}
                              hasPendingRequest={trip.joinRequests.length > 0}
                            />
                          </div>
                        </div>


                        <div className="max-w-3xl">
                          <h3 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                            {trip.title}
                          </h3>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/90">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDotsIcon size={14} className="text-primary" />
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "-"} to{" "}
                              {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "-"}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <UsersThreeIcon size={14} className="text-primary" />
                              {trip.participants.length} participants
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
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </section>
    </main>
  );
}
