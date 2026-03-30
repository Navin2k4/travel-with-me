"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { updateTripAction, reviewJoinRequestAction } from "@/lib/actions/trips";
import { InviteManager } from "@/components/trips/invite-manager";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">General Information</h3>
          </div>
          <CardContent className="p-5 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workspace-trip-title" className="text-slate-600">Trip Title</Label>
              <Input
                id="workspace-trip-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your trip a catchy name"
                className="bg-white focus-visible:ring-indigo-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workspace-trip-description" className="text-slate-600">Description</Label>
              <Textarea
                id="workspace-trip-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this trip about?"
                className="min-h-[100px] bg-white focus-visible:ring-indigo-500"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-slate-600">Trip Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger className="w-full bg-white focus:ring-indigo-500">
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
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <SuitcaseSimple className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-800">Logistics & Planning</h3>
          </div>
          <CardContent className="p-5 grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="grid gap-2">
                <Label htmlFor="workspace-trip-start" className="text-slate-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" /> Start Date
                </Label>
                <Input
                  id="workspace-trip-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workspace-trip-end" className="text-slate-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" /> End Date
                </Label>
                <Input
                  id="workspace-trip-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label className="text-slate-600 flex items-center gap-1">
                  <Gear className="w-4 h-4 text-slate-400" /> Date Flexibility
                </Label>
                <Select value={dateFlexibility} onValueChange={(v) => setDateFlexibility(v as typeof dateFlexibility)}>
                  <SelectTrigger className="w-full bg-white">
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
                <Label htmlFor="workspace-start-point" className="text-slate-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> Start Point
                </Label>
                <Input
                  id="workspace-start-point"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder="e.g. London, UK"
                  className="bg-white"
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="text-slate-600 flex items-center gap-1">
                  <Car className="w-4 h-4 text-slate-400" /> Mode of Transport
                </Label>
                <Select value={transportMode || "NONE"} onValueChange={(v) => setTransportMode(v === "NONE" ? "" : (v as typeof transportMode))}>
                  <SelectTrigger className="w-full bg-white">
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
                <Label htmlFor="workspace-transport-notes" className="text-slate-600">Transport Notes</Label>
                <Input
                  id="workspace-transport-notes"
                  value={transportNotes}
                  onChange={(e) => setTransportNotes(e.target.value)}
                  placeholder="Flight tickets booking ID, Car rental details, etc."
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-xl">
            {hasChanges && (
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Unsaved changes
              </span>
            )}
            <Button 
              disabled={isPending || title.trim().length === 0 || !hasChanges} 
              onClick={saveTripDetails} 
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              {isPending ? "Saving changes..." : "Save Trip Details"}
            </Button>
          </div>
        </Card>

      </div>

      {/* RIGHT COLUMN: Access Control & Overview */}
      <div className="grid gap-6 h-fit">
        
        {/* Quick Stats Widget (replaces the basic boxes from old design) */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-linear-to-br from-slate-800 to-slate-900 text-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                Snapshot
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5" /> Members
                </span>
                <span className="text-xl font-bold">{participantsCount}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-1">
                  <Receipt className="w-3.5 h-3.5" /> Expenses
                </span>
                <span className="text-xl font-bold">{expensesCount}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-700">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5" /> Total Spend
                </span>
                <span className="text-2xl font-bold text-emerald-400 tracking-tight">
                  {formatCurrency(totalSpend)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentUserId === trip.createdById && (
          <Card className="border-amber-200/80 shadow-sm overflow-hidden bg-amber-50/30">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-800">Join Requests</h3>
              </div>
              {trip.joinRequests.length > 0 && (
                <Badge className="bg-amber-500 hover:bg-amber-600">{trip.joinRequests.length}</Badge>
              )}
            </div>
            <CardContent className="p-0">
              {trip.joinRequests.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-amber-100 shadow-xs mb-3 text-amber-300">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No pending requests.</p>
                </div>
              ) : (
                <div className="divide-y divide-amber-100">
                  {trip.joinRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-white/60 hover:bg-white transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={request.requesterAvatar || DEFAULT_USER_AVATAR_URL}
                          alt={request.requesterName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-800 truncate">{request.requesterName}</p>
                          <p className="text-xs text-slate-500">
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
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => reviewJoinRequest(request.id, "REJECTED")}
                          disabled={isPending}
                          className="w-full text-slate-600 hover:text-slate-900 border-slate-200"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <LinkIcon className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800">Invite Links</h3>
          </div>
          <CardContent className="p-5">
            <InviteManager tripId={trip.id} invites={trip.invites} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
