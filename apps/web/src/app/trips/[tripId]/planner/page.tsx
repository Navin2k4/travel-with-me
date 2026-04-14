import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationPlannerTab } from "@/components/trips/planner/location-planner-tab";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ tripId: string }>;
};

export default async function TripPlannerPage({ params }: Props) {
  const { tripId } = await params;

  const [trip, plannedPlaces] = await Promise.all([
    prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, title: true },
    }),
    prisma.tripPlannedPlace.findMany({
      where: { tripId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        googlePlaceId: true,
        name: true,
        formattedAddress: true,
        latitude: true,
        longitude: true,
        mapUrl: true,
        position: true,
      },
    }),
  ]);

  if (!trip) {
    return <main className="p-4 text-sm text-muted-foreground">Trip not found.</main>;
  }

  const googleMapsApiKey = process.env.GOOGLE_LOCATION_API_KEY ?? "";

  return (
    <main className="grid gap-4">
      <Tabs defaultValue="location" className="w-full">
        <TabsList className="rounded-lg bg-primary text-black p-1">
          <TabsTrigger value="location" className="rounded-md text-black">
            Location Planner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="mt-3">
          <LocationPlannerTab
            tripId={tripId}
            googleMapsApiKey={googleMapsApiKey}
            initialPlaces={plannedPlaces}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
