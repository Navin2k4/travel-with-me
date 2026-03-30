"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVisitedPlaceAction } from "@/lib/actions/visited-places";
import { addMediaToPlaceAction } from "@/lib/actions/visited-places";
import { normalizeHttpUrl } from "@/lib/normalize-http-url";
import { PLACE_CATEGORY_OPTIONS, type PlaceCategory } from "@/lib/places/place-categories";
import { visitScheduleToVisitedAtIso } from "@/lib/visit-datetime";
import { UploadButton } from "@/lib/uploadthing";

type Participant = { id: string; name: string };
type ExpenseOption = { id: string; title: string };

export function AddPlaceModal({
  tripId,
  addedById,
  participants,
  expenses,
}: {
  tripId: string;
  addedById: string;
  participants: Participant[];
  expenses: ExpenseOption[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("OTHER");
  const [visitedDate, setVisitedDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visitorIds, setVisitorIds] = useState<string[]>(participants.map((user) => user.id));
  const [expenseIds, setExpenseIds] = useState<string[]>([]);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [placeImageUrls, setPlaceImageUrls] = useState<string[]>([]);
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const filteredExpenses = useMemo(() => {
    const q = expenseSearch.trim().toLowerCase();
    if (q.length === 0) return [];
    return expenses
      .filter((expense) => !expenseIds.includes(expense.id) && expense.title.toLowerCase().includes(q))
      .slice(0, 12);
  }, [expenses, expenseSearch, expenseIds]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setTags((current) => [...new Set([...current, t])]);
    setTagInput("");
  };

  const toggleId = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));
  };

  const linkExpense = (expenseId: string) => {
    setExpenseIds((current) => (current.includes(expenseId) ? current : [...current, expenseId]));
    setExpenseSearch("");
  };

  const unlinkExpense = (expenseId: string) => {
    setExpenseIds((current) => current.filter((id) => id !== expenseId));
  };

  const appendImageFromUrlInput = () => {
    const normalized = normalizeHttpUrl(imageUrlDraft);
    if (!normalized) {
      toast.error("Enter a valid http(s) image URL.");
      return;
    }
    setPlaceImageUrls((current) => (current.includes(normalized) ? current : [...current, normalized]));
    setImageUrlDraft("");
    toast.success("Image URL added.");
  };

  const removePlaceImage = (url: string) => {
    setPlaceImageUrls((current) => current.filter((u) => u !== url));
  };

  const submit = () => {
    startTransition(async () => {
      const visitedAtIso = visitScheduleToVisitedAtIso(visitedDate, fromTime, toTime);

      const result = await createVisitedPlaceAction({
        tripId,
        addedById,
        name,
        category,
        visitedAt: visitedAtIso || undefined,
        notes: notes.trim() || undefined,
        tags,
        visitorIds,
        expenseIds,
        locationUrl: locationUrl.trim() || undefined,
        rating: rating ? Number(rating) : undefined,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to add place.");
        return;
      }

      if (placeImageUrls.length > 0) {
        for (const url of placeImageUrls) {
          await addMediaToPlaceAction({
            tripId,
            visitedPlaceId: result.data.id,
            url,
            type: "IMAGE",
          });
        }
      }

      toast.success("Place added.");
      setName("");
      setCategory("OTHER");
      setVisitedDate("");
      setFromTime("");
      setToTime("");
      setNotes("");
      setRating("");
      setTags([]);
      setTagInput("");
      setVisitorIds(participants.map((user) => user.id));
      setExpenseIds([]);
      setExpenseSearch("");
      setLocationUrl("");
      setPlaceImageUrls([]);
      setImageUrlDraft("");
      setOpen(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setVisitorIds(participants.map((user) => user.id));
          setExpenseSearch("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Add Place</Button>
      </DialogTrigger>
      <DialogContent className="w-md md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Visited Place</DialogTitle>
          <DialogDescription>Capture place details with schedule, people, images, and linked expenses.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="place-name">Name *</Label>
              <Input id="place-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tea shop" />
            </div>
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
              <Label>Visit schedule</Label>
              <p className="text-xs text-muted-foreground">
                Date and <span className="font-medium text-foreground">From</span> time set the visit time on the place. <span className="font-medium text-foreground">To</span> is optional (not saved as a second timestamp); put ranges in Notes if you want them kept.
              </p>
              <div className="grid  sm:grid-cols-3">
                <Input type="date" value={visitedDate} onChange={(e) => setVisitedDate(e.target.value)} />
                <div className="grid gap-1">
                  <Input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Rating (1-5)</Label>
              <Input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="place-location-url">Location link (optional)</Label>
              <Input
                id="place-location-url"
                type="url"
                inputMode="url"
                value={locationUrl}
                onChange={(e) => setLocationUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
              <p className="text-xs text-muted-foreground">Maps, website, or any https link for this place.</p>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Memories..." />
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. sunrise" />
                <Button variant="outline" type="button" onClick={addTag}>
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

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Place images (optional)</Label>
              <p className="text-xs text-muted-foreground">
                Upload from your device or paste a direct image URL (<code className="text-[11px]">https://</code>).
              </p>
              <div className="relative overflow-hidden rounded-lg border bg-muted/30">
                {placeImageUrls.length > 0 ? (
                  <>
                    <img src={placeImageUrls[0]} alt="Place preview" className="h-44 w-full object-cover" />
                    <div className="absolute bottom-3 right-3">
                      <UploadButton
                        endpoint="placeImageUploader"
                        appearance={{
                          button:
                            "h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/80 ut-uploading:text-primary-foreground",
                          allowedContent: "hidden",
                        }}
                        content={{
                          button: () => "Add upload",
                        }}
                        onClientUploadComplete={(files) => {
                          const urls = (files ?? []).map((f) => f.ufsUrl);
                          if (urls.length === 0) return;
                          setPlaceImageUrls((current) => [...new Set([...current, ...urls])]);
                          toast.success("Image(s) uploaded.");
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(error.message);
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-3">
                    <UploadButton
                      endpoint="placeImageUploader"
                      appearance={{
                        button:
                          "h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/80 ut-uploading:text-primary-foreground",
                        allowedContent: "text-xs text-muted-foreground",
                      }}
                      content={{
                        button: () => "Upload images",
                        allowedContent: () => "PNG, JPG, WEBP up to 4MB each",
                      }}
                      onClientUploadComplete={(files) => {
                        const urls = (files ?? []).map((f) => f.ufsUrl);
                        if (urls.length === 0) return;
                        setPlaceImageUrls((current) => [...new Set([...current, ...urls])]);
                        toast.success("Image(s) uploaded.");
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(error.message);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  id="place-image-url"
                  type="url"
                  inputMode="url"
                  className="flex-1"
                  value={imageUrlDraft}
                  onChange={(e) => setImageUrlDraft(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      appendImageFromUrlInput();
                    }
                  }}
                />
                <Button type="button" variant="outline" className="shrink-0" onClick={appendImageFromUrlInput}>
                  Add URL
                </Button>
              </div>
              {placeImageUrls.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {placeImageUrls.map((url) => (
                    <Badge key={url} variant="secondary" className="max-w-full gap-1 py-1 pr-1 font-normal">
                      <span className="max-w-[min(280px,55vw)] truncate" title={url}>
                        {url.length > 48 ? `${url.slice(0, 48)}…` : url}
                      </span>
                      <button
                        type="button"
                        className="rounded-sm px-0.5 hover:bg-muted"
                        aria-label="Remove image"
                        onClick={() => removePlaceImage(url)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>Participants</Label>
              <div className="grid grid-cols-2 gap-2">
                {participants.map((user) => (
                  <Button
                    key={user.id}
                    type="button"
                    variant={visitorIds.includes(user.id) ? "default" : "outline"}
                    onClick={() => toggleId(user.id, setVisitorIds)}
                  >
                    {user.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="place-expense-search">Link expenses (optional)</Label>
              <Input
                id="place-expense-search"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="Search trip expenses by title…"
                autoComplete="off"
              />
              {expenseSearch.trim().length > 0 && filteredExpenses.length === 0 ? (
                <p className="text-xs text-muted-foreground">No matching expenses. Try another search.</p>
              ) : null}
              {filteredExpenses.length > 0 ? (
                <div
                  className="max-h-36 overflow-y-auto rounded-md border bg-popover text-sm shadow-sm"
                  aria-label="Matching expenses"
                >
                  {filteredExpenses.map((expense) => (
                    <button
                      key={expense.id}
                      type="button"
                      className="flex w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-accent"
                      onClick={() => linkExpense(expense.id)}
                    >
                      {expense.title}
                    </button>
                  ))}
                </div>
              ) : expenseSearch.trim().length === 0 && expenses.length > 0 ? (
                <p className="text-xs text-muted-foreground">Search to find and link expenses — they are not all listed at once.</p>
              ) : expenses.length === 0 ? (
                <p className="text-xs text-muted-foreground">Add trip expenses first to link them here.</p>
              ) : null}
              {expenseIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {expenseIds.map((id) => {
                    const linked = expenses.find((e) => e.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1 font-normal">
                        <span className="max-w-[200px] truncate">{linked?.title ?? "Expense"}</span>
                        <button
                          type="button"
                          className="rounded-sm px-0.5 hover:bg-muted"
                          aria-label={`Remove ${linked?.title ?? "expense"}`}
                          onClick={() => unlinkExpense(id)}
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={submit} disabled={!canSubmit || isPending}>
            {isPending ? "Saving..." : "Save Place"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
