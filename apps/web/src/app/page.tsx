import { CreateTripForm } from "@/components/trips/create-trip-form";
import { TripAccessAction } from "@/components/trips/trip-access-action";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDotsIcon,
  FlagPennantIcon,
  PathIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_IMAGE_PLACEHOLDER_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Share2Icon } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  await requireUser("/");
  const currentUser = await getCurrentUser();
  if (!currentUser) return <main className="p-4">Please log in to continue.</main>;

  const [users, trips, myTripMemberships] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.trip.findMany({
      include: {
        participants: { select: { userId: true, isActive: true, user: { select: { name: true } } } },
        joinRequests: {
          where: { requesterId: currentUser.id, status: "PENDING" },
          select: { id: true },
        },
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tripParticipant.findMany({
      where: { userId: currentUser.id, isActive: true },
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
    <main className="mx-auto grid w-full max-w-6xl gap-6 p-4">

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="">
          <CardContent className="grid gap-3">
            {trips.length === 0 ? (
              <div className="rounded border border-dashed p-6 text-sm text-muted-foreground">
                No trips yet. Create your first trip from the panel.
              </div>
            ) : (
              trips.map((trip) => {
                const knownPeople = getRandomizedKnownPeople(trip.participants);
                const knownPreview = knownPeople.slice(0, 2).join(", ");
                const remaining = Math.max(0, knownPeople.length - 2);
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
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`rounded-full border px-2.5 py-1 font-medium backdrop-blur-sm ${getStatusClassName(trip.status)}`}>
                              {trip.status}
                            </span>
                            <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-card-foreground backdrop-blur-sm">
                              {trip.dateFlexibility === "MAY_CHANGE" ? "Dates may change" : "Dates fixed"}
                            </span>
                          </div>

                          <TripAccessAction
                            tripId={trip.id}
                            hasAccess={hasAccess}
                            hasPendingRequest={trip.joinRequests.length > 0}
                          />
                        </div>
                        {trip.status === "ENDED" && (

                          <Link
                            href={`/trips/${trip.id}/story`}
                            target="_blank"
                            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1.5 font-medium text-primary backdrop-blur-sm"
                          >
                            <Share2Icon className="h-5 w-5" /> <span className="text-sm">Story</span>
                          </Link>
                        )}

                        <div className="max-w-3xl rounded-xl ">
                          <h3 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">{trip.title}</h3>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/90">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDotsIcon size={14} />
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "-"} to{" "}
                              {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "-"}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <UsersThreeIcon size={14} />
                              {trip.participants.length} participants
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <FlagPennantIcon size={13} />
                              {trip.startPoint || "Start point not set"}
                            </span>
                            {trip.transportMode ? (
                              <span className="inline-flex items-center gap-1.5">
                                <PathIcon size={13} />
                                {trip.transportMode}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">
                            {knownPeople.length > 0 ? (
                              <span>
                                With {knownPreview}
                                {remaining > 0 ? ` +${remaining}` : ""}
                              </span>
                            ) : (
                              <span>No known co-travelers yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <CreateTripForm
          currentUser={{
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          }}
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            hasTripHistory: plannedWithUserIds.has(u.id),
          })).filter((u) => u.id !== currentUser.id)}
        />
      </section>
    </main>
  );
}
