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
import { Tag, Plus, IdentificationBadge } from "@phosphor-icons/react";

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

// Fun alternating background colors for the cards to give it a playful retro vibe
const bgColors = [
  "bg-[#A6E3E9]",
  "bg-[#CBF1F5]",
  "bg-[#71C9CE]",
];

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

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b-4 border-[#393E46] mb-4">
        <div>
          <h2 className="text-3xl font-black text-[#393E46] uppercase tracking-tight flex items-center gap-3">
            Trip Crew
          </h2>
          <p className="text-[#393E46]/70 font-bold mt-1">
            Manage your participants and slap some custom tags on them!
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {participants.map((participant, index) => {
          const cardBg = bgColors[index % bgColors.length];
          // Determine a slight random rotation for stickers
          const rotations = ["-rotate-3", "rotate-2", "-rotate-6", "rotate-6", "-rotate-2", "rotate-3"];
          
          return (
            <div 
              key={participant.id} 
              className={`relative flex flex-col items-center p-6 rounded-2xl border-[3px] border-[#393E46] shadow-[6px_6px_0px_0px_#393E46] ${cardBg} transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#393E46] duration-200`}
            >
              {/* Profile Image with brutalist styling */}
              <div className="relative mb-4">
                <img
                  src={participant.avatar || DEFAULT_USER_AVATAR_URL}
                  alt={participant.name}
                  className="w-24 h-24 rounded-full object-cover border-[3px] border-[#393E46] shadow-[4px_4px_0px_0px_#393E46] bg-white"
                />
                
                {/* Super user or role badge could go here if we had one, but we'll use a neat sticker style button */}
                <button
                  onClick={() => openTagModal(participant.id)}
                  title={`Add tag to ${participant.name}`}
                  className="absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center bg-[#00ADB5] text-white rounded-full border-[3px] border-[#393E46] shadow-[2px_2px_0px_0px_#393E46] hover:bg-[#71C9CE] hover:-translate-y-0.5 transition-transform cursor-pointer z-10"
                >
                  <Plus weight="bold" className="w-5 h-5" />
                </button>
              </div>

              {/* Persona Info */}
              <h3 className="text-xl font-black text-[#393E46] tracking-tight text-center mb-1">
                {participant.name}
              </h3>
              
              {/* Tags Area */}
              <div className="w-full mt-5 pt-5 border-t-[3px] border-[#393E46]/20 flex flex-wrap justify-center gap-3 min-h-[60px]">
                {participant.tags.length === 0 ? (
                  <span className="text-sm font-bold text-[#393E46]/60 italic flex items-center gap-1">
                    <Tag className="w-4 h-4" /> No tags yet
                  </span>
                ) : (
                  participant.tags.map((tag, tIndex) => {
                    const rotClass = rotations[(index + tIndex) % rotations.length];
                    return (
                      <span 
                        key={tag.id} 
                        className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold text-xs uppercase tracking-wider text-[#EEEEE] bg-[#393E46] border-[2px] border-[#393E46] rounded-sm shadow-[2px_2px_0px_0px_#00ADB5] ${rotClass} hover:rotate-0 transition-all cursor-default text-white`}
                      >
                        <Tag weight="bold" className="w-3 h-3 text-[#00ADB5]" /> {tag.label}
                      </span>
                    )
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="border-[3px] border-[#393E46] shadow-[8px_8px_0px_0px_#393E46] rounded-xl sm:rounded-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-black uppercase text-[#393E46]">Stamp a Tag</DialogTitle>
            <DialogDescription className="font-bold text-[#393E46]/70">
              {selectedParticipant ? `Give ${selectedParticipant.name} a fun or descriptive identifier!` : "Select a user."}
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 p-4 border-[3px] border-[#393E46] rounded-xl bg-[#E3FDFD] shadow-[4px_4px_0px_0px_#393E46]">
                <img
                  src={selectedParticipant.avatar || DEFAULT_USER_AVATAR_URL}
                  alt={selectedParticipant.name}
                  className="h-12 w-12 rounded-full object-cover border-[2px] border-[#393E46]"
                />
                <div className="font-black text-xl text-[#393E46]">{selectedParticipant.name}</div>
              </div>
              
              <div className="grid gap-2 mt-2">
                <Label htmlFor="tag-input" className="font-bold text-[#393E46] uppercase tracking-wider text-xs">New Tag Label</Label>
                <Input
                  id="tag-input"
                  placeholder="e.g. VIP, Driver, Photographer"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="border-[3px] border-[#393E46] shadow-[4px_4px_0px_0px_#393E46] font-bold h-12 text-base focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#00ADB5] transition-colors"
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
              className="border-[3px] border-[#393E46] shadow-[4px_4px_0px_0px_#393E46] font-bold uppercase hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => selectedParticipant && assignCustomTagForUser(selectedParticipant.id)}
              disabled={isPending || !selectedParticipant || !tagInput.trim()}
              className="bg-[#00ADB5] hover:bg-[#71C9CE] text-white border-[3px] border-[#393E46] shadow-[4px_4px_0px_0px_#393E46] font-black uppercase tracking-wider hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_#393E46] transition-all"
            >
              {isPending ? "Stamping..." : "Add Tag!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
