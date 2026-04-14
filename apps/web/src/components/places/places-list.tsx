"use client";

import { PlaceCard } from "@/components/places/place-card";
type Place = {
  id: string;
  tripId: string;
  name: string;
  category: string;
  visitedAt: string;
  dayNumber: number | null;
  tags: string[];
  rating: number | null;
  mediaUrl: string | null;
  notes: string | null;
  locationUrl: string | null;
  visitors: Array<{ id: string; name: string; avatar: string | null }>;
  ratings: Array<{ userId: string; userName: string; rating: number }>;
};

export function PlacesList({
  places,
  onDelete,
  onRate,
  currentUserId,
}: {
  places: Place[];
  onDelete: (visitedPlaceId: string) => void;
  onRate: (visitedPlaceId: string, rating: number) => void;
  currentUserId?: string;
}) {
  if (places.length === 0) {
    return <div className="rounded border border-dashed p-4 text-sm text-muted-foreground">No places added yet.</div>;
  }

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} onDelete={onDelete} onRate={onRate} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
