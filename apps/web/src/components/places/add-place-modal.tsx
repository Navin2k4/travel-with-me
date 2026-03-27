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
  const [category, setCategory] = useState<"ATTRACTION" | "FOOD" | "STAY" | "SHOPPING" | "OTHER">("OTHER");
  const [visitedDate, setVisitedDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visitorIds, setVisitorIds] = useState<string[]>(participants.map((user) => user.id));
  const [expenseIds, setExpenseIds] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setTags((current) => [...new Set([...current, t])]);
    setTagInput("");
  };

  const toggleId = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));
  };

  const submit = () => {
    startTransition(async () => {
      const visitedAt = visitedDate && fromTime ? `${visitedDate}T${fromTime}` : "";
      const durationNote =
        visitedDate && (fromTime || toTime)
          ? `Time: ${visitedDate} ${fromTime || "--:--"} to ${toTime || "--:--"}`
          : "";
      const mergedNotes = [notes.trim(), durationNote].filter(Boolean).join("\n");

      const result = await createVisitedPlaceAction({
        tripId,
        addedById,
        name,
        category,
        visitedAt: visitedAt || undefined,
        notes: mergedNotes || undefined,
        tags,
        visitorIds,
        expenseIds,
        rating: rating ? Number(rating) : undefined,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to add place.");
        return;
      }

      if (uploadedImageUrls.length > 0) {
        for (const url of uploadedImageUrls) {
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
      setUploadedImageUrls([]);
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
              <Label>Visit Schedule (Date-From-To)</Label>
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
              <Label>Place Images (optional)</Label>
              <div className="relative overflow-hidden rounded-lg border bg-muted/30">
                {uploadedImageUrls.length > 0 ? (
                  <>
                    <img
                      src={uploadedImageUrls[0]}
                      alt="Place upload preview"
                      className="h-44 w-full object-cover"
                    />
                    <div className="absolute bottom-3 right-3">
                      <UploadButton
                        endpoint="placeImageUploader"
                        appearance={{
                          button:
                            "h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/80 ut-uploading:text-primary-foreground",
                          allowedContent: "hidden",
                        }}
                        content={{
                          button: () => "Update Images",
                        }}
                        onClientUploadComplete={(files) => {
                          const urls = (files ?? []).map((f) => f.ufsUrl);
                          if (urls.length === 0) return;
                          setUploadedImageUrls((current) => [...new Set([...current, ...urls])]);
                          toast.success("Place image(s) uploaded.");
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
                        button: () => "Upload Images",
                        allowedContent: () => "PNG, JPG, WEBP up to 4MB each",
                      }}
                      onClientUploadComplete={(files) => {
                        const urls = (files ?? []).map((f) => f.ufsUrl);
                        if (urls.length === 0) return;
                        setUploadedImageUrls((current) => [...new Set([...current, ...urls])]);
                        toast.success("Place image(s) uploaded.");
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(error.message);
                      }}
                    />
                  </div>
                )}
              </div>
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
              <Label>Link expenses (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {expenses.map((expense) => (
                  <Button
                    key={expense.id}
                    type="button"
                    variant={expenseIds.includes(expense.id) ? "default" : "outline"}
                    onClick={() => toggleId(expense.id, setExpenseIds)}
                  >
                    {expense.title}
                  </Button>
                ))}
              </div>
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
