import { requireUser } from "@/lib/auth/guards";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [wishlistRows, myMemberships] = await Promise.all([
    prisma.tripWishlist.findMany({
      where: { userId: user.id },
      include: {
        trip: {
          include: {
            participants: {
              select: { userId: true, isActive: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tripParticipant.findMany({
      where: { userId: currentUser.id, isActive: true },
      select: { tripId: true },
    }),
  ]);

  const myTripIds = myMemberships.map((row) => row.tripId);
  const crewRows = myTripIds.length
    ? await prisma.tripParticipant.findMany({
        where: {
          tripId: { in: myTripIds },
          userId: { not: currentUser.id },
          isActive: true,
        },
        select: {
          userId: true,
          tripId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      })
    : [];

  const crewMap = new Map<
    string,
    { id: string; name: string; email: string; avatar: string | null; tripIds: Set<string> }
  >();
  for (const row of crewRows) {
    const existing = crewMap.get(row.userId);
    if (!existing) {
      crewMap.set(row.userId, {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        avatar: row.user.avatar,
        tripIds: new Set([row.tripId]),
      });
      continue;
    }
    existing.tripIds.add(row.tripId);
  }

  const pastCrews = [...crewMap.values()]
    .map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      avatar: member.avatar,
      tripsTogether: member.tripIds.size,
    }))
    .sort((a, b) => b.tripsTogether - a.tripsTogether || a.name.localeCompare(b.name));

  return (
    <main className="mx-auto min-h-screen flex w-full max-w-7xl flex-col gap-4 p-4">
      <ProfileTabs
        account={{
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar ?? null,
        }}
        wishlistTrips={wishlistRows.map((row) => ({
          id: row.trip.id,
          title: row.trip.title,
          coverImage: row.trip.coverImage,
          status: row.trip.status,
          dateFlexibility: row.trip.dateFlexibility,
          startDate: row.trip.startDate ? row.trip.startDate.toISOString() : null,
          endDate: row.trip.endDate ? row.trip.endDate.toISOString() : null,
          startPoint: row.trip.startPoint,
          transportMode: row.trip.transportMode,
          participantsCount: row.trip.participants.length,
          hasAccess: row.trip.participants.some((participant) => participant.userId === currentUser.id && participant.isActive),
        }))}
        pastCrews={pastCrews}
      />
    </main>
  );
}
