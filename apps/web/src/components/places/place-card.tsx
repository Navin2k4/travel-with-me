"use client";

import { useState, useTransition } from "react";
import { NotePencilIcon, StarIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_IMAGE_PLACEHOLDER_URL, DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { updateVisitedPlaceAction } from "@/lib/actions/visited-places";

type PlaceCardProps = {
  place: {
    id: string;
    name: string;
    category: string;
    visitedAt: string;
    tags: string[];
    rating: number | null;
    mediaUrl: string | null;
    visitors: Array<{ id: string; name: string; avatar: string | null }>;
    ratings: Array<{ userId: string; userName: string; rating: number }>;
    notes: string | null;
    dayNumber: number | null;
    tripId: string;
  };
  onDelete: (visitedPlaceId: string) => void;
  onRate: (visitedPlaceId: string, rating: number) => void;
  currentUserId?: string;
};

export function PlaceCard({ place, onDelete, onRate, currentUserId }: PlaceCardProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(place.name);
  const [category, setCategory] = useState(place.category);
  const [visitedAt, setVisitedAt] = useState(new Date(place.visitedAt).toISOString().slice(0, 16));
  const [notes, setNotes] = useState(place.notes ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(place.tags);
  const [dayNumber, setDayNumber] = useState(place.dayNumber ? String(place.dayNumber) : "");
  const currentUserRating = currentUserId
    ? place.ratings.find((item) => item.userId === currentUserId)?.rating
    : undefined;
  const [ratingInput, setRatingInput] = useState<string>(String(currentUserRating ?? 5));
  const [isPending, startTransition] = useTransition();

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    setTags((current) => [...new Set([...current, value])]);
    setTagInput("");
  };

  const saveEdit = () => {
    startTransition(async () => {
      const result = await updateVisitedPlaceAction({
        tripId: place.tripId,
        visitedPlaceId: place.id,
        name,
        category,
        visitedAt,
        notes: notes || null,
        tags,
        dayNumber: dayNumber ? Number(dayNumber) : null,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to update place.");
        return;
      }
      toast.success("Place updated.");
      setOpen(false);
    });
  };

  return (
    <Card>
      <CardContent className="grid gap-3">
        <div className="relative overflow-hidden rounded">
          <img src={place.mediaUrl || DEFAULT_IMAGE_PLACEHOLDER_URL} alt={place.name} className="h-48 w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/50" />
          <div className="absolute left-3 top-3 text-white">
            <p className="text-sm font-semibold leading-tight">{place.name}</p>
            <p className="text-xs text-white/90">{new Date(place.visitedAt).toLocaleString()}</p>
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {place.rating && (
              <Badge className="inline-flex items-center gap-1">
                <StarIcon weight="fill" />
                {place.rating}/5
              </Badge>
            )}
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => setOpen(true)}
              aria-label={`Edit ${place.name}`}
              className="h-7 w-7"
            >
              <NotePencilIcon />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={() => onDelete(place.id)}
              aria-label={`Delete ${place.name}`}
              className="h-7 w-7"
            >
              <TrashIcon />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 grid gap-2">
            <div className="flex -space-x-2">
              {place.visitors.map((visitor) => {
                const userRating = place.ratings.find((item) => item.userId === visitor.id)?.rating;
                return (
                  <div key={visitor.id} className="relative">
                    <img
                      src={visitor.avatar || DEFAULT_USER_AVATAR_URL}
                      alt={visitor.name}
                      title={userRating ? `${visitor.name} • ${userRating}/5` : visitor.name}
                      className="h-7 w-7 rounded-full border border-white/60 object-cover"
                    />
                    {userRating ? (
                      <span className="absolute -bottom-1 -right-1 z-50 rounded bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
                        {userRating}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          {place.tags.length > 0 && (
            <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-1">
              {place.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{place.category}</Badge>
        </div>
        {currentUserId && (
          <div className="flex items-center gap-2">
            <Input
              className="h-8 w-16"
              type="number"
              min="1"
              max="5"
              value={ratingInput}
              onChange={(e) => setRatingInput(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => onRate(place.id, Number(ratingInput))}
              disabled={isPending || Number(ratingInput) < 1 || Number(ratingInput) > 5}
            >
              Rate
            </Button>
          </div>
        )}
        {place.notes && <p className="text-xs text-muted-foreground">{place.notes}</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
            <DialogDescription>Update place details after your trip.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATTRACTION">Attraction</SelectItem>
                    <SelectItem value="FOOD">Food</SelectItem>
                    <SelectItem value="STAY">Stay</SelectItem>
                    <SelectItem value="SHOPPING">Shopping</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Day Number</Label>
                <Input type="number" min="1" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Visited At</Label>
              <Input type="datetime-local" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={saveEdit} disabled={isPending || !name.trim()}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
