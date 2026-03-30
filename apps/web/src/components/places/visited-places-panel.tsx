"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AddPlaceModal } from "@/components/places/add-place-modal";
import { PlacesList } from "@/components/places/places-list";
import { TimelineView } from "@/components/places/timeline-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  deleteVisitedPlaceAction,
  toggleVisitedUserAction,
  ratePlaceAction,
} from "@/lib/actions/visited-places";
import {
  getFavoritePlace,
  getGroupAverageRating,
  getMostVisitedCategory,
  getTotalPlacesVisited,
} from "@/lib/domain/visited-places/insights";
import { placeCategoryLabel, type PlaceCategory } from "@/lib/places/place-categories";

type PlaceView = {
  id: string;
  tripId: string;
  name: string;
  category: PlaceCategory;
  visitedAt: string;
  dayNumber: number | null;
  tags: string[];
  rating: number | null;
  notes: string | null;
  locationUrl: string | null;
  visitors: Array<{ id: string; name: string; avatar: string | null }>;
  ratings: Array<{ userId: string; userName: string; rating: number }>;
  media: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
};

export function VisitedPlacesPanel({
  tripId,
  addedById,
  currentUserId,
  participants,
  expenses,
  places,
}: {
  tripId: string;
  addedById: string;
  currentUserId?: string;
  participants: Array<{ id: string; name: string }>;
  expenses: Array<{ id: string; title: string }>;
  places: PlaceView[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId ?? "");
  const [rating, setRating] = useState<string>("5");

  const insights = useMemo(() => {
    const light = places.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      rating: place.rating,
    }));
    return {
      total: getTotalPlacesVisited(light),
      favorite: getFavoritePlace(light),
      topCategory: getMostVisitedCategory(light),
      average: getGroupAverageRating(light),
    };
  }, [places]);

  const handleDelete = (visitedPlaceId: string) => {
    startTransition(async () => {
      const result = await deleteVisitedPlaceAction({ tripId, visitedPlaceId });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to delete place.");
        return;
      }
      toast.success("Place removed.");
    });
  };

  const handleToggleVisitedUser = () => {
    if (!selectedPlaceId || !selectedUserId) return;
    startTransition(async () => {
      const result = await toggleVisitedUserAction({
        tripId,
        visitedPlaceId: selectedPlaceId,
        userId: selectedUserId,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to toggle user.");
        return;
      }
      toast.success("Visited users updated.");
    });
  };

  const handleRate = () => {
    if (!selectedPlaceId || !currentUserId) return;
    startTransition(async () => {
      const result = await ratePlaceAction({
        tripId,
        visitedPlaceId: selectedPlaceId,
        userId: currentUserId,
        rating: Number(rating),
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to rate place.");
        return;
      }
      toast.success("Rating saved.");
    });
  };

  const handleRateForCurrentUser = (visitedPlaceId: string, value: number) => {
    if (!currentUserId) return;
    startTransition(async () => {
      const result = await ratePlaceAction({
        tripId,
        visitedPlaceId,
        userId: currentUserId,
        rating: value,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to rate place.");
        return;
      }
      toast.success("Rating saved.");
    });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Visited Places</CardTitle>
              <CardDescription>Capture memories and summarize your trip experience.</CardDescription>
            </div>
            <AddPlaceModal tripId={tripId} addedById={addedById} participants={participants} expenses={expenses} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border p-3 text-sm">Total places: <b>{insights.total}</b></div>
          <div className="rounded border p-3 text-sm">Favorite: <b>{insights.favorite?.name ?? "-"}</b></div>
          <div className="rounded border p-3 text-sm">
            Top category:{" "}
            <b>{insights.topCategory ? placeCategoryLabel(insights.topCategory.category) : "-"}</b>
          </div>
          <div className="rounded border p-3 text-sm">Avg rating: <b>{insights.average ?? "-"}</b></div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Quick Place Actions</CardTitle>
          <CardDescription>Toggle visitors and set ratings with minimal effort.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <select
            className="rounded border p-2 text-sm"
            aria-label="Select place"
            title="Select place"
            value={selectedPlaceId}
            onChange={(e) => setSelectedPlaceId(e.target.value)}
          >
            <option value="">Select place</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
          <select
            className="rounded border p-2 text-sm"
            aria-label="Select user for visitor toggle"
            title="Select user for visitor toggle"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select user</option>
            {participants.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" disabled={isPending} onClick={handleToggleVisitedUser}>
            Toggle Visitor
          </Button>
          <div className="flex gap-2">
            <input
              className="w-16 rounded border p-2 text-sm"
              type="number"
              aria-label="Rating value"
              title="Rating value"
              placeholder="1-5"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <Button type="button" disabled={isPending || !selectedPlaceId || !currentUserId} onClick={handleRate}>
              Rate
            </Button>
          </div>
        </CardContent>
      </Card> */}

      <Tabs defaultValue="list">
        <TabsList variant="line">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <PlacesList
            places={places.map((place) => ({
              id: place.id,
              tripId: place.tripId,
              name: place.name,
              category: place.category,
              visitedAt: place.visitedAt,
              dayNumber: place.dayNumber,
              tags: place.tags,
              rating: place.rating,
              mediaUrl: place.media[0]?.url ?? null,
              notes: place.notes,
              locationUrl: place.locationUrl,
              visitors: place.visitors,
              ratings: place.ratings,
            }))}
            onDelete={handleDelete}
            onRate={handleRateForCurrentUser}
            currentUserId={currentUserId}
          />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineView
            places={places.map((place) => ({
              id: place.id,
              name: place.name,
              visitedAt: place.visitedAt,
              dayNumber: place.dayNumber,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
