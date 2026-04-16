import { notFound } from "next/navigation";
import { TripCommunityTab } from "@/components/trips/trip-community-tab";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_IMAGE_PLACEHOLDER_URL, DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ tripId: string }>;
};

export default async function TripCommunityPage({ params }: Props) {
  const { tripId } = await params;
  const currentUser = await getCurrentUser();

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      communityThreads: {
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          votes: {
            select: { userId: true, value: true },
          },
          messages: {
            include: {
              author: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      participants: {
        where: { isActive: true },
        orderBy: { joinedAt: "asc" },
        select: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  if (!trip) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative">

        <div className="relative z-20 mx-auto mt-4 w-full max-w-7xl px-4 ">
          <div
            className="rounded-2xl border border-border p-5 backdrop-blur-sm md:p-6"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.5)), url(${trip.coverImage || DEFAULT_IMAGE_PLACEHOLDER_URL})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Trip Community
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {trip.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Open community conversations, questions, and crew insights for this trip.
            </p>

            <div className="mt-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">Crew that traveled this trip</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.participants.map((participant) => (
                  <div key={participant.user.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-2.5 py-1.5">
                    <img
                      src={participant.user.avatar || DEFAULT_USER_AVATAR_URL}
                      alt={participant.user.name}
                      className="h-6 w-6 rounded-full border border-border object-cover"
                    />
                    <span className="text-xs font-medium text-foreground">{participant.user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 z-20 grid w-full max-w-7xl gap-4 px-4 pb-8 md:pb-10">
        <TripCommunityTab
          tripId={trip.id}
          currentUserId={currentUser?.id}
          threads={trip.communityThreads.map((thread) => ({
            id: thread.id,
            body: thread.body,
            isDeleted: thread.isDeleted,
            createdAt: thread.createdAt.toISOString(),
            author: {
              id: thread.author.id,
              name: thread.author.name,
              avatar: thread.author.avatar,
            },
            votes: thread.votes.map((vote) => ({
              userId: vote.userId,
              value: vote.value,
            })),
            messages: thread.messages.map((message) => ({
              id: message.id,
              body: message.body,
              isDeleted: message.isDeleted,
              createdAt: message.createdAt.toISOString(),
              parentId: message.parentId,
              author: {
                id: message.author.id,
                name: message.author.name,
                avatar: message.author.avatar,
              },
            })),
          }))}
        />
      </div>
    </main>
  );
}
