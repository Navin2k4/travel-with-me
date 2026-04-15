"use client";

import { useEffect, useState, useTransition } from "react";
import { LinkSimpleIcon, NotePencilIcon, StarIcon, TrashIcon } from "@phosphor-icons/react";
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
import { addMediaToPlaceAction, updateVisitedPlaceAction } from "@/lib/actions/visited-places";
import { normalizeHttpUrl } from "@/lib/normalize-http-url";
import { UploadButton } from "@/lib/uploadthing";
import { dateTimeLocalValueToIso, formatDateTimeLocalInput } from "@/lib/visit-datetime";
import {
  PLACE_CATEGORY_OPTIONS,
  asPlaceCategory,
  placeCategoryLabel,
  type PlaceCategory,
} from "@/lib/places/place-categories";

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
    locationUrl: string | null;
  };
  onDelete: (visitedPlaceId: string) => void;
  onRate: (visitedPlaceId: string, rating: number) => void;
  currentUserId?: string;
};

export function PlaceCard({ place, onDelete, onRate, currentUserId }: PlaceCardProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(place.name);
  const [category, setCategory] = useState<PlaceCategory>(() => asPlaceCategory(place.category));
  const [visitedAt, setVisitedAt] = useState(() => formatDateTimeLocalInput(new Date(place.visitedAt)));
  const [notes, setNotes] = useState(place.notes ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(place.tags);
  const [dayNumber, setDayNumber] = useState(place.dayNumber ? String(place.dayNumber) : "");
  const [locationUrl, setLocationUrl] = useState(place.locationUrl ?? "");
  const [newImageUrl, setNewImageUrl] = useState("");
  const currentUserRating = currentUserId
    ? place.ratings.find((item) => item.userId === currentUserId)?.rating
    : undefined;
  const [ratingInput, setRatingInput] = useState<number>(currentUserRating ?? 0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRatingInput(currentUserRating ?? 0);
  }, [currentUserRating, place.id]);

  useEffect(() => {
    if (!open) return;
    setName(place.name);
    setCategory(asPlaceCategory(place.category));
    setVisitedAt(formatDateTimeLocalInput(new Date(place.visitedAt)));
    setNotes(place.notes ?? "");
    setTags(place.tags);
    setDayNumber(place.dayNumber ? String(place.dayNumber) : "");
    setLocationUrl(place.locationUrl ?? "");
    setNewImageUrl("");
  }, [open, place]);

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    setTags((current) => [...new Set([...current, value])]);
    setTagInput("");
  };

  const saveEdit = () => {
    const visitedAtIso = dateTimeLocalValueToIso(visitedAt);
    if (!visitedAtIso) {
      toast.error("Invalid visit date or time.");
      return;
    }
    startTransition(async () => {
      const result = await updateVisitedPlaceAction({
        tripId: place.tripId,
        visitedPlaceId: place.id,
        name,
        category,
        visitedAt: visitedAtIso,
        notes: notes || null,
        tags,
        dayNumber: dayNumber ? Number(dayNumber) : null,
        locationUrl: locationUrl.trim() ? locationUrl.trim() : null,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to update place.");
        return;
      }
      toast.success("Place updated.");
      setOpen(false);
    });
  };

  const addPhotoFromUrl = () => {
    const normalized = normalizeHttpUrl(newImageUrl);
    if (!normalized) {
      toast.error("Enter a valid http(s) image URL.");
      return;
    }
    startTransition(async () => {
      const result = await addMediaToPlaceAction({
        tripId: place.tripId,
        visitedPlaceId: place.id,
        url: normalized,
        type: "IMAGE",
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to add image.");
        return;
      }
      toast.success("Image added.");
      setNewImageUrl("");
    });
  };

  return (
    <div>
      <div className="grid gap-3">
        <div className="relative overflow-hidden rounded">
          <img src={place.mediaUrl || DEFAULT_IMAGE_PLACEHOLDER_URL} alt={place.name} className="h-48 w-full bg-white/20 object-cover" />
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
            {place.locationUrl ? (
              <Button variant="secondary" size="icon-sm" className="h-7 w-7" asChild>
                <a
                  href={place.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open location link"
                  title="Open location link"
                >
                  <LinkSimpleIcon className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
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
                      className="h-7 w-7 rounded-full border border-white/60 object-cover rounded-br-2xl"
                    />
                    {userRating ? (
                      <span className="absolute -bottom-1 -right-1 z-50 rounded-full bg-primary px-1.5 text-[10px] leading-4 text-primary-foreground">
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
        <div className="flex items-center justify-between">

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{placeCategoryLabel(place.category)}</Badge>
          </div>
          {currentUserId && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    aria-label={`Rate ${place.name} ${starValue} out of 5`}
                    title={`${starValue} star${starValue > 1 ? "s" : ""}`}
                    onClick={() => {
                      setRatingInput(starValue);
                      onRate(place.id, starValue);
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded transition hover:scale-105"
                  >
                    <StarIcon
                      className={`h-5 w-5 ${starValue <= ratingInput ? "text-amber-400" : "text-muted-foreground/50"}`}
                      weight={starValue <= ratingInput ? "fill" : "regular"}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {place.notes && <p className="text-xs bg-white/20 backdrop-blur-sm text-white border border-border rounded-md p-2">{place.notes}</p>}
      </div>

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
                <Select value={category} onValueChange={(v) => setCategory(v as PlaceCategory)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACE_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
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
              <Label htmlFor={`place-url-${place.id}`}>Location link (optional)</Label>
              <Input
                id={`place-url-${place.id}`}
                type="url"
                inputMode="url"
                value={locationUrl}
                onChange={(e) => setLocationUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Add photos</Label>
              <p className="text-xs text-muted-foreground">Upload a file or paste a direct image URL — saves immediately.</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="url"
                  inputMode="url"
                  className="flex-1"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPhotoFromUrl();
                    }
                  }}
                />
                <Button type="button" variant="outline" className="shrink-0" onClick={addPhotoFromUrl} disabled={isPending}>
                  Add from URL
                </Button>
              </div>
              <UploadButton
                endpoint="placeImageUploader"
                appearance={{
                  button:
                    "h-9 w-full rounded-none border border-border bg-background px-3 text-xs font-medium hover:bg-muted ut-uploading:cursor-not-allowed ut-uploading:opacity-70 sm:w-auto",
                  allowedContent: "text-xs text-muted-foreground",
                }}
                content={{
                  button: () => "Upload image",
                  allowedContent: () => "PNG, JPG, WEBP",
                }}
                onClientUploadComplete={(files) => {
                  const urls = (files ?? []).map((f) => f.ufsUrl).filter(Boolean);
                  if (urls.length === 0) return;
                  startTransition(async () => {
                    for (const url of urls) {
                      const result = await addMediaToPlaceAction({
                        tripId: place.tripId,
                        visitedPlaceId: place.id,
                        url,
                        type: "IMAGE",
                      });
                      if (!result.ok) {
                        toast.error(typeof result.error === "string" ? result.error : "Failed to add image.");
                        return;
                      }
                    }
                    toast.success(urls.length > 1 ? `Added ${urls.length} images.` : "Image added.");
                  });
                }}
                onUploadError={(error: Error) => {
                  toast.error(error.message);
                }}
              />
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
    </div>
  );
}
