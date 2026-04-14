"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { assignParticipantTagAction } from "@/lib/actions/trips";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tag, Plus, UserPlus } from "@phosphor-icons/react";

type Participant = {
  id: string;
  name: string;
  avatar: string | null;
  tags: Array<{ id: string; label: string }>;
};

type TripUserInformationTabProps = {
  tripId: string;
  participants: Participant[];
};

export function TripUserInformationTab({
  tripId,
  participants,
}: TripUserInformationTabProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedParticipant = participants.find((p) => p.id === selectedUserId) ?? null;

  const openTagModal = (userId: string) => {
    setSelectedUserId(userId);
    setTagInput("");
    setIsTagModalOpen(true);
  };

  const assignCustomTagForUser = (userId: string) => {
    const customLabel = tagInput.trim();
    if (!customLabel) return;

    startTransition(async () => {
      const result = await assignParticipantTagAction({
        tripId,
        userId,
        customLabel,
      });

      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to assign custom tag.");
        return;
      }

      toast.success("Custom tag assigned!");
      setTagInput("");
      setIsTagModalOpen(false);
    });
  };

  const handleInviteUser = () => {
    toast.info("Use Trip Detail > Invite Links to generate an invite token.");
  };

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">



      <div className="grid gap-8 pt-8 md:grid-cols-2 xl:grid-cols-3">
        <div className="group relative mt-8 rounded-3xl border border-border/80 bg-card/70 px-5 pt-14 pb-5 text-center shadow-sm backdrop-blur-md transition-transform duration-200 hover:-translate-y-1">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-muted text-primary shadow-sm">
              <UserPlus className="h-9 w-9" weight="duotone" />
            </div>
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Invite User
          </h3>

          <div className="my-4 h-px w-full bg-border/60" />

          <div className="flex min-h-[40px] w-full items-center justify-center">
            <Button type="button" onClick={handleInviteUser} className="rounded-full px-5">
              <UserPlus className="mr-2 h-4 w-4" weight="bold" />
              Invite User
            </Button>
          </div>
        </div>
        {participants.map((participant) => {
          return (
            <div
              key={participant.id}
              className="group relative mt-8 rounded-3xl border border-border/80 bg-card/70 px-5 pt-14 pb-5 text-center shadow-sm backdrop-blur-md transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <img
                  src={participant.avatar || DEFAULT_USER_AVATAR_URL}
                  alt={participant.name}
                  className="h-24 w-24 rounded-full border-2 border-border bg-card object-cover shadow-sm"
                />

                <button
                  onClick={() => openTagModal(participant.id)}
                  title={`Add tag to ${participant.name}`}
                  className="absolute -right-1 -bottom-1 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Plus weight="bold" className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {participant.name}
              </h3>

              <div className="my-4 h-px w-full bg-border/60" />

              <div className="flex min-h-[40px] w-full flex-wrap justify-center gap-2">
                {participant.tags.length === 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" /> No tags yet
                  </span>
                ) : (
                  participant.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground"
                    >
                      <Tag weight="bold" className="h-3.5 w-3.5 text-primary" /> {tag.label}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="rounded-xl border border-border sm:rounded-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-semibold text-foreground">Add a tag</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedParticipant ? `Give ${selectedParticipant.name} a fun or descriptive identifier!` : "Select a user."}
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-accent/30 p-4">
                <img
                  src={selectedParticipant.avatar || DEFAULT_USER_AVATAR_URL}
                  alt={selectedParticipant.name}
                  className="h-12 w-12 rounded-full border border-border object-cover"
                />
                <div className="text-xl font-semibold text-foreground">{selectedParticipant.name}</div>
              </div>

              <div className="grid gap-2 mt-2">
                <Label htmlFor="tag-input" className="text-xs uppercase tracking-wider text-muted-foreground">New Tag Label</Label>
                <Input
                  id="tag-input"
                  placeholder="e.g. VIP, Driver, Photographer"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="h-12 border-border text-base"
                  autoFocus
                />
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end mt-4">
            <Button
              type="button"
              onClick={() => setIsTagModalOpen(false)}
              variant="outline"
              className="uppercase"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => selectedParticipant && assignCustomTagForUser(selectedParticipant.id)}
              disabled={isPending || !selectedParticipant || !tagInput.trim()}
              className="uppercase tracking-wider"
            >
              {isPending ? "Stamping..." : "Add Tag!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
