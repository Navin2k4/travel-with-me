import { TripWorkspaceTabs } from "@/components/trips/trip-workspace-tabs";
import { TripCoverUploadButton } from "@/components/trips/trip-cover-upload-button";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_IMAGE_PLACEHOLDER_URL } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { decimalAmountToNumber } from "@/lib/money";

type Props = {
  params: Promise<{ tripId: string }>;
};

export default async function TripPage({ params }: Props) {
  const { tripId } = await params;
  await requireUser(`/trips/${tripId}`);
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return <main className="p-4">Please log in to continue.</main>;
  }

  const membership = await prisma.tripParticipant.findUnique({
    where: {
      tripId_userId: {
        tripId,
        userId: currentUser.id,
      },
    },
    select: { isActive: true },
  });

  if (!membership?.isActive) {
    return <main className="p-4">You do not have access to this trip.</main>;
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      participants: {
        include: {
          user: true,
          tags: { include: { tag: true }, orderBy: { assignedAt: "desc" } },
        },
        orderBy: { joinedAt: "asc" },
      },
      expenses: {
        include: {
          paidBy: true,
          splits: {
            include: { user: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      settlements: {
        include: { fromUser: true, toUser: true },
        orderBy: { amount: "desc" },
      },
      visitedPlaces: {
        include: {
          media: true,
          visitors: { include: { user: true } },
          ratings: { include: { user: true } },
        },
        orderBy: { visitedAt: "desc" },
      },
      invites: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
      joinRequests: {
        where: { status: "PENDING" },
        include: { requester: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!trip) {
    return <main className="p-4">Trip not found.</main>;
  }

  const tripCustomExpenseCategories = Array.from(
    new Set(
      trip.expenses
        .map((expense) => expense.customCategory?.trim() ?? "")
        .filter((value) => value.length > 0),
    ),
  );

  return (
    <main className="mx-auto grid w-full max-w-6xl  p-4">
      <Card className="p-0 m-0 border-0 shadow-none rounded-xl">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={trip.coverImage || DEFAULT_IMAGE_PLACEHOLDER_URL}
            alt={`${trip.title} cover`}
            className="h-36 w-full object-cover md:h-44"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 text-white md:p-6">
            <h1 className="text-2xl font-semibold md:text-3xl">{trip.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/90 md:text-base">
              {trip.description || "No description provided."}
            </p>
          </div>
          <div className="absolute bottom-4 right-4 z-10 md:bottom-6 md:right-6">
            <TripCoverUploadButton tripId={trip.id} />
          </div>
        </div>
      </Card>

      <TripWorkspaceTabs
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
          startDate: trip.startDate ? trip.startDate.toISOString().slice(0, 10) : null,
          endDate: trip.endDate ? trip.endDate.toISOString().slice(0, 10) : null,
          createdById: trip.createdById,
          invites: trip.invites.map((invite) => ({
            id: invite.id,
            token: invite.token,
            usedCount: invite.usedCount,
            maxUses: invite.maxUses,
            expiresAt: invite.expiresAt ? invite.expiresAt.toISOString() : null,
            isActive: invite.isActive,
          })),
          joinRequests: trip.joinRequests.map((request) => ({
            id: request.id,
            requesterId: request.requesterId,
            requesterName: request.requester.name,
            requesterAvatar: request.requester.avatar,
            createdAt: request.createdAt.toISOString(),
            status: request.status,
          })),
        }}
        currentUserId={currentUser?.id}
        customExpenseCategories={tripCustomExpenseCategories}
        participants={trip.participants.map((participant) => ({
          id: participant.user.id,
          name: participant.user.name,
          avatar: participant.user.avatar,
          tags: participant.tags.map((tagLink) => ({
            id: tagLink.tagId,
            label: tagLink.tag.label,
          })),
        }))}
        expenses={trip.expenses.map((expense) => ({
          id: expense.id,
          title: expense.title,
          notes: expense.notes,
          paidById: expense.paidById,
          paidByName: expense.paidBy.name,
          splitType: expense.splitType,
          category: expense.category,
          customCategory: expense.customCategory,
          paymentMode: expense.paymentMode,
          amount: decimalAmountToNumber(expense.amount),
          currency: expense.currency,
          splits: expense.splits.map((split) => ({
            userName: split.user.name,
            amount: decimalAmountToNumber(split.amount),
            percentageBp: split.percentageBp,
            shares: split.shares,
          })),
        }))}
        settlements={trip.settlements.map((settlement) => ({
          id: settlement.id,
          fromUserId: settlement.fromUserId,
          toUserId: settlement.toUserId,
          fromUserName: settlement.fromUser.name,
          toUserName: settlement.toUser.name,
          amount: decimalAmountToNumber(settlement.amount),
          isSettled: settlement.isSettled,
          settledAt: settlement.settledAt ? settlement.settledAt.toISOString() : null,
        }))}
        visitedPlaces={trip.visitedPlaces.map((place) => ({
          id: place.id,
          tripId: trip.id,
          name: place.name,
          category: place.category,
          visitedAt: place.visitedAt.toISOString(),
          dayNumber: place.dayNumber,
          tags: place.tags,
          rating: place.rating,
          notes: place.notes,
          locationUrl: place.locationUrl,
          visitors: place.visitors.map((visitor) => ({
            id: visitor.user.id,
            name: visitor.user.name,
            avatar: visitor.user.avatar,
          })),
          ratings: place.ratings.map((rating) => ({
            userId: rating.user.id,
            userName: rating.user.name,
            rating: rating.rating,
          })),
          media: place.media.map((m) => ({
            id: m.id,
            url: m.url,
            type: m.type,
          })),
        }))}
      />
    </main>
  );
}
