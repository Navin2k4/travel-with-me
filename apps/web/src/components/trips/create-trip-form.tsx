"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createTripAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { UploadButton } from "@/lib/uploadthing";

type UserOption = {
  id: string;
  name: string;
  email: string;
  hasTripHistory: boolean;
};

export function CreateTripForm({
  currentUser,
  users,
}: {
  currentUser: { id: string; name: string; email: string };
  users: UserOption[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [dateFlexibility, setDateFlexibility] = useState<"FIXED" | "MAY_CHANGE">("FIXED");
  const [transportMode, setTransportMode] = useState<"FLIGHT" | "TRAIN" | "BUS" | "CAR" | "BIKE" | "SHIP" | "WALK" | "OTHER" | "">("");
  const [transportNotes, setTransportNotes] = useState("");
  const [status, setStatus] = useState<"PLANNING" | "STARTED" | "ONGOING" | "ENDED">("PLANNING");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createdById] = useState(currentUser.id);
  const [participantIds, setParticipantIds] = useState<string[]>([currentUser.id]);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit = useMemo(
    () => title.trim().length > 0 && participantIds.length > 0 && startDate.length > 0,
    [title, participantIds, startDate],
  );

  const toggleParticipant = (userId: string) => {
    setParticipantIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const selectedParticipants = users.filter((user) => participantIds.includes(user.id));
  const filteredUsers = users.filter((user) => {
    const q = participantSearch.trim().toLowerCase();
    if (!q) return user.hasTripHistory;
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Trip</CardTitle>
        <CardDescription>Start a new trip and choose participants.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="trip-title">Title</Label>
          <Input
            id="trip-title"
            placeholder="Goa Weekend"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="trip-description">Description</Label>
          <Textarea
            id="trip-description"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="trip-start-date">Start Date *</Label>
            <Input
              id="trip-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trip-end-date">End Date</Label>
            <Input
              id="trip-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Trip Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="STARTED">Started</SelectItem>
                <SelectItem value="ONGOING">On Going</SelectItem>
                <SelectItem value="ENDED">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="trip-start-point">Start Point</Label>
            <Input
              id="trip-start-point"
              placeholder="e.g. Chennai"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Date Flexibility</Label>
            <Select value={dateFlexibility} onValueChange={(v) => setDateFlexibility(v as typeof dateFlexibility)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">Fixed</SelectItem>
                <SelectItem value="MAY_CHANGE">May Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Mode of Transport</Label>
            <Select value={transportMode || "NONE"} onValueChange={(v) => setTransportMode(v === "NONE" ? "" : (v as typeof transportMode))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Optional transport mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Not decided</SelectItem>
                <SelectItem value="FLIGHT">Flight</SelectItem>
                <SelectItem value="TRAIN">Train</SelectItem>
                <SelectItem value="BUS">Bus</SelectItem>
                <SelectItem value="CAR">Car</SelectItem>
                <SelectItem value="BIKE">Bike</SelectItem>
                <SelectItem value="SHIP">Ship</SelectItem>
                <SelectItem value="WALK">Walk</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trip-transport-notes">Transport Notes</Label>
            <Input
              id="trip-transport-notes"
              placeholder="Optional details"
              value={transportNotes}
              onChange={(e) => setTransportNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Cover Image (optional)</Label>
          <div className="rounded-lg border bg-muted/30 p-3">
            <UploadButton
              endpoint="tripCoverUploader"
              appearance={{
                button:
                  "h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/80 ut-uploading:text-primary-foreground",
                allowedContent: "text-xs text-muted-foreground",
              }}
              content={{
                button: () => (coverImage ? "Update Image" : "Upload Image"),
                allowedContent: () => "PNG, JPG, WEBP up to 4MB",
              }}
              onClientUploadComplete={(files) => {
                const file = files?.[0];
                if (!file) return;
                setCoverImage(file.ufsUrl);
                toast.success("Trip cover uploaded.");
              }}
              onUploadError={(error: Error) => {
                toast.error(error.message);
              }}
            />
          </div>
          {coverImage && (
            <img src={coverImage} alt="Trip cover preview" className="h-24 w-full rounded object-cover" />
          )}
        </div>
        <div className="grid gap-2">
          <Label>Created by</Label>
          <div className="rounded border bg-muted/30 px-3 py-1 text-sm flex items-center gap-2">
            <span className="font-medium">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">({currentUser.email})</span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Participants</Label>
          <div className="flex items-center justify-between gap-2 rounded border p-2">
            <span className="text-sm text-muted-foreground">
              {participantIds.length} selected
            </span>
            <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">Add Participants</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Select Participants</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <Input
                    placeholder="Search by name or email"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                  />
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {filteredUsers.length === 0 ? (
                      <div className="rounded border border-dashed p-3 text-xs text-muted-foreground">
                        {participantSearch.trim()
                          ? "No users found for this search."
                          : "No previous trip collaborators found. Search by name or email to add users."}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleParticipant(user.id)}
                          className="flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm hover:bg-muted/50"
                        >
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                          <span>{participantIds.includes(user.id) ? "Selected" : "Add"}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <DialogFooter showCloseButton>
                  <Button type="button" onClick={() => setIsParticipantsOpen(false)}>Done</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {selectedParticipants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border bg-muted/30 px-2 py-1 text-xs">
                {currentUser.name} (You)
              </span>
              {selectedParticipants.map((user) => (
                <span key={user.id} className="rounded-full border px-2 py-1 text-xs">
                  {user.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button
          disabled={!canSubmit || isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await createTripAction({
                title,
                description,
                coverImage,
                startPoint,
                dateFlexibility,
                transportMode: transportMode || undefined,
                transportNotes,
                status,
                startDate,
                endDate: endDate || undefined,
                createdById,
                participantIds,
              });
              if (!result.ok) {
                toast.error("Failed to create trip.");
                return;
              }
              toast.success("Trip created.");
              setTitle("");
              setDescription("");
              setCoverImage("");
              setStartPoint("");
              setDateFlexibility("FIXED");
              setTransportMode("");
              setTransportNotes("");
              setStatus("PLANNING");
              setStartDate("");
              setEndDate("");
            })
          }
        >
          {isPending ? "Creating..." : "Create Trip"}
        </Button>
      </CardContent>
    </Card>
  );
}
