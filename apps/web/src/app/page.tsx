import { CreateTripForm } from "@/components/trips/create-trip-form";
import { TripAccessAction } from "@/components/trips/trip-access-action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDotsIcon,
  FlagPennantIcon,
  PathIcon,
  UsersThreeIcon,
  WalletIcon,
} from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_IMAGE_PLACEHOLDER_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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
    if (status === "PLANNING") return "bg-blue-100 text-blue-800 border-blue-200";
    if (status === "STARTED") return "bg-amber-100 text-amber-800 border-amber-200";
    if (status === "ONGOING") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    return "bg-zinc-200 text-zinc-800 border-zinc-300";
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
              trips.map((trip) => (
                (() => {
                  const knownPeople = getRandomizedKnownPeople(trip.participants);
                  const knownPreview = knownPeople.slice(0, 2).join(", ");
                  const remaining = Math.max(0, knownPeople.length - 2);
                  return (
                <div key={trip.id} className="group relative overflow-hidden rounded-xl border">
                  <img
                    src={trip.coverImage || DEFAULT_IMAGE_PLACEHOLDER_URL}
                    alt={`${trip.title} cover`}
                    className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/20" />
                  <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`rounded-lg text-[10px] px-1 py-0.5  font-medium ${getStatusClassName(trip.status)}`}>
                          {trip.status}
                        </span>
                        <span className="rounded-full bg-white text-[10px] px-2 py-0.5 text-black">
                          {trip.dateFlexibility === "MAY_CHANGE" ? "Dates may change" : "Dates fixed"}
                        </span>
                      </div>
                      <TripAccessAction
                        tripId={trip.id}
                        hasAccess={trip.participants.some((participant) => participant.userId === currentUser.id && participant.isActive)}
                        hasPendingRequest={trip.joinRequests.length > 0}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xl font-semibold leading-tight">{trip.title}</div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/95">
                        <div className="inline-flex items-center gap-1.5">
                          <CalendarDotsIcon size={14} />
                          <span>
                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "-"} to{" "}
                            {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "-"}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5">
                          <UsersThreeIcon size={14} />
                          <span>{trip.participants.length} participants</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/80">
                        <div className="inline-flex items-center gap-1.5">
                          <FlagPennantIcon size={13} />
                          <span>{trip.startPoint || "Start point not set"}</span>
                        </div>
                        {trip.transportMode && (
                          <div className="inline-flex items-center gap-1.5">
                            <PathIcon size={13} />
                            <span>{trip.transportMode}</span>
                          </div>
                        )}
                        {knownPeople.length > 0 && (
                          <div className="ml-auto text-right">
                            <span>
                              With {knownPreview}
                              {remaining > 0 ? ` +${remaining}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                  );
                })()
              ))
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
