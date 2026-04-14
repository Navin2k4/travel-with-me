import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TripStoryView } from "@/components/trips/trip-story-view";

type Props = {
  params: Promise<{ tripId: string }>;
};

export default async function TripStoryPage({ params }: Props) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      startDate: true,
      endDate: true,
      startPoint: true,
      transportMode: true,
      transportNotes: true,
      dateFlexibility: true,
      participants: {
        where: { isActive: true },
        orderBy: { joinedAt: "asc" },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tags: {
            orderBy: { assignedAt: "asc" },
            select: {
              tag: {
                select: { id: true, label: true },
              },
            },
          },
        },
      },
      visitedPlaces: {
        orderBy: [{ dayNumber: "asc" }, { visitedAt: "asc" }],
        select: {
          id: true,
          name: true,
          category: true,
          visitedAt: true,
          dayNumber: true,
          media: {
            select: {
              id: true,
              url: true,
              type: true,
            },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  return (
    <TripStoryView
      trip={{
        id: trip.id,
        title: trip.title,
        description: trip.description,
        coverImage: trip.coverImage,
        startDate: trip.startDate ? trip.startDate.toISOString() : null,
        endDate: trip.endDate ? trip.endDate.toISOString() : null,
        startPoint: trip.startPoint,
        transportMode: trip.transportMode,
        transportNotes: trip.transportNotes,
        dateFlexibility: trip.dateFlexibility,
        participants: trip.participants.map((participant) => ({
          id: participant.user.id,
          name: participant.user.name,
          avatar: participant.user.avatar,
          tags: participant.tags.map((tagLink) => tagLink.tag.label),
        })),
        visitedPlaces: trip.visitedPlaces.map((place) => ({
          id: place.id,
          name: place.name,
          category: place.category,
          dayNumber: place.dayNumber,
          visitedAt: place.visitedAt.toISOString(),
          previewImage: place.media[0]?.url ?? null,
        })),
      }}
    />
  );
}
