"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { updateTripAction, reviewJoinRequestAction } from "@/lib/actions/trips";
import { InviteManager } from "@/components/trips/invite-manager";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";

import {
  Gear,
  Info,
  Calendar,
  MapPin,
  Car,
  SuitcaseSimple,
  Link as LinkIcon,
  UserPlus,
  Users,
  Receipt,
  Coins
} from "@phosphor-icons/react";

type JoinRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type Invite = {
  id: string;
  token: string;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
};

type TripDetailTabProps = {
  trip: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    status: "PLANNING" | "STARTED" | "ONGOING" | "ENDED";
    startPoint: string | null;
    dateFlexibility: "FIXED" | "MAY_CHANGE";
    transportMode: "FLIGHT" | "TRAIN" | "BUS" | "CAR" | "BIKE" | "SHIP" | "WALK" | "OTHER" | null;
    transportNotes: string | null;
    startDate: string | null;
    endDate: string | null;
    createdById: string;
    invites: Invite[];
    joinRequests: JoinRequest[];
  };
  currentUserId?: string;
  participantsCount: number;
  expensesCount: number;
  totalSpend: number;
};

export function TripDetailTab({
  trip,
  currentUserId,
  participantsCount,
  expensesCount,
  totalSpend,
}: TripDetailTabProps) {
  const [title, setTitle] = useState(trip.title);
  const [description, setDescription] = useState(trip.description ?? "");
  const [startPoint, setStartPoint] = useState(trip.startPoint ?? "");
  const [status, setStatus] = useState<"PLANNING" | "STARTED" | "ONGOING" | "ENDED">(trip.status);
  const [dateFlexibility, setDateFlexibility] = useState<"FIXED" | "MAY_CHANGE">(trip.dateFlexibility);
  const [transportMode, setTransportMode] = useState<
    "FLIGHT" | "TRAIN" | "BUS" | "CAR" | "BIKE" | "SHIP" | "WALK" | "OTHER" | ""
  >(trip.transportMode ?? "");
  const [transportNotes, setTransportNotes] = useState(trip.transportNotes ?? "");
  const [startDate, setStartDate] = useState(trip.startDate ?? "");
  const [endDate, setEndDate] = useState(trip.endDate ?? "");
  
  const [isPending, startTransition] = useTransition();

  const saveTripDetails = () => {
    startTransition(async () => {
      const result = await updateTripAction({
        tripId: trip.id,
        title,
        description,
        startPoint,
        status,
        dateFlexibility,
        transportMode: transportMode || null,
        transportNotes,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to update trip.");
        return;
      }
      toast.success("Trip details updated successfully.");
    });
  };

  const reviewJoinRequest = (requestId: string, decision: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await reviewJoinRequestAction({
        tripId: trip.id,
        requestId,
        decision,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to review request.");
        return;
      }
      toast.success(decision === "APPROVED" ? "Join request approved." : "Join request rejected.");
    });
  };

  const hasChanges = 
    title !== trip.title ||
    description !== (trip.description ?? "") ||
    startPoint !== (trip.startPoint ?? "") ||
    status !== trip.status ||
    dateFlexibility !== trip.dateFlexibility ||
    transportMode !== (trip.transportMode ?? "") ||
    transportNotes !== (trip.transportNotes ?? "") ||
    startDate !== (trip.startDate ?? "") ||
    endDate !== (trip.endDate ?? "");

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 lg:grid-cols-[1.5fr_1fr]">
      
      {/* LEFT COLUMN: Configuration */}
      <div className="grid gap-6 h-fit">
        
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-4">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">General Information</h3>
          </div>
          <div className="grid gap-4 p-5">
            <div className="grid gap-2">
              <Label htmlFor="workspace-trip-title" className="text-muted-foreground">Trip Title</Label>
              <Input
                id="workspace-trip-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your trip a catchy name"
                className="border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workspace-trip-description" className="text-muted-foreground">Description</Label>
              <Textarea
                id="workspace-trip-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this trip about?"
                className="min-h-[100px] border-border"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Trip Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger className="w-full border-border">
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
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-4">
            <SuitcaseSimple className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Logistics & Planning</h3>
          </div>
          <div className="grid gap-5 p-5">
            <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="workspace-trip-start" className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Start Date
                </Label>
                <Input
                  id="workspace-trip-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workspace-trip-end" className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> End Date
                </Label>
                <Input
                  id="workspace-trip-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label className="flex items-center gap-1 text-muted-foreground">
                  <Gear className="h-4 w-4" /> Date Flexibility
                </Label>
                <Select value={dateFlexibility} onValueChange={(v) => setDateFlexibility(v as typeof dateFlexibility)}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Strict / Fixed Dates</SelectItem>
                    <SelectItem value="MAY_CHANGE">Flexible / May Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="workspace-start-point" className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Start Point
                </Label>
                <Input
                  id="workspace-start-point"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder="e.g. London, UK"
                  className="border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="flex items-center gap-1 text-muted-foreground">
                  <Car className="h-4 w-4" /> Mode of Transport
                </Label>
                <Select value={transportMode || "NONE"} onValueChange={(v) => setTransportMode(v === "NONE" ? "" : (v as typeof transportMode))}>
                  <SelectTrigger className="w-full border-border">
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

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="workspace-transport-notes" className="text-muted-foreground">Transport Notes</Label>
                <Input
                  id="workspace-transport-notes"
                  value={transportNotes}
                  onChange={(e) => setTransportNotes(e.target.value)}
                  placeholder="Flight tickets booking ID, Car rental details, etc."
                  className="border-border"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 p-4">
            {hasChanges && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Unsaved changes
              </span>
            )}
            <Button 
              disabled={isPending || title.trim().length === 0 || !hasChanges} 
              onClick={saveTripDetails} 
              type="button"
            >
              {isPending ? "Saving changes..." : "Save Trip Details"}
            </Button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Access Control & Overview */}
      <div className="grid gap-6 h-fit">
        


        {currentUserId === trip.createdById && (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Join Requests</h3>
              </div>
              {trip.joinRequests.length > 0 && (
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">{trip.joinRequests.length}</Badge>
              )}
            </div>
            <div className="p-0">
              {trip.joinRequests.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No pending requests.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {trip.joinRequests.map((request) => (
                    <div key={request.id} className="bg-background p-4 transition-colors hover:bg-muted/20">
                      <div className="mb-3 flex items-center gap-3">
                        <img
                          src={request.requesterAvatar || DEFAULT_USER_AVATAR_URL}
                          alt={request.requesterName}
                          className="h-10 w-10 rounded-full border border-border object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{request.requesterName}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => reviewJoinRequest(request.id, "APPROVED")}
                          disabled={isPending}
                          className="w-full"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => reviewJoinRequest(request.id, "REJECTED")}
                          disabled={isPending}
                          className="w-full"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-4">
            <LinkIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Invite Links</h3>
          </div>
          <div className="p-5">
            <InviteManager tripId={trip.id} invites={trip.invites} />
          </div>
        </div>

      </div>
    </div>
  );
}
