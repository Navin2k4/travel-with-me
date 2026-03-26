"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { assignParticipantTagAction } from "@/lib/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESET_OPTIONS = [
  { value: "FOR_FUN", label: "For Fun" },
  { value: "TRAVEL_ANALYST", label: "Travel Analyst" },
  { value: "FINANCE_MANAGER", label: "Finance Manager" },
  { value: "TIMING_PLANNER", label: "Timing Planner" },
] as const;

type ParticipantOption = { id: string; name: string };

export function ParticipantTagManager({
  tripId,
  participants,
}: {
  tripId: string;
  participants: ParticipantOption[];
}) {
  const [userId, setUserId] = useState(participants[0]?.id ?? "");
  const [preset, setPreset] = useState<string>(PRESET_OPTIONS[0]?.value ?? "FOR_FUN");
  const [customLabel, setCustomLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  const assignPreset = () => {
    startTransition(async () => {
      const result = await assignParticipantTagAction({ tripId, userId, preset });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to assign preset tag.");
        return;
      }
      toast.success("Preset tag assigned.");
    });
  };

  const assignCustom = () => {
    startTransition(async () => {
      const result = await assignParticipantTagAction({ tripId, userId, customLabel });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to assign custom tag.");
        return;
      }
      toast.success("Custom tag assigned.");
      setCustomLabel("");
    });
  };

  return (
    <div className="grid gap-4 rounded border p-4">
      <h3 className="text-sm font-medium">Participant Tags</h3>
      <div className="grid gap-2">
        <Label>Participant</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select participant" />
          </SelectTrigger>
          <SelectContent>
            {participants.map((participant) => (
              <SelectItem key={participant.id} value={participant.id}>
                {participant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Prebuilt tag</Label>
        <div className="flex gap-2">
          <Select value={preset} onValueChange={setPreset}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" type="button" disabled={isPending} onClick={assignPreset}>
            Assign
          </Button>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Custom tag</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Custom tag (e.g. Flight Ninja)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
          />
          <Button type="button" disabled={isPending || customLabel.trim().length < 1} onClick={assignCustom}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
