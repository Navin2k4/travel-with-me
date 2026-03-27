"use client";

import { useMemo, useState, useTransition } from "react";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AddExpenseForm } from "@/components/expenses/add-expense-form";
import { VisitedPlacesPanel } from "@/components/places/visited-places-panel";
import { InviteManager } from "@/components/trips/invite-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteExpenseAction,
  generateSettlementAction,
  settleSettlementAction,
  updateExpenseAction,
} from "@/lib/actions/expenses";
import { assignParticipantTagAction, reviewJoinRequestAction, updateTripAction } from "@/lib/actions/trips";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

type ParticipantView = {
  id: string;
  name: string;
  avatar: string | null;
  tags: Array<{ id: string; label: string }>;
};

type ExpenseView = {
  id: string;
  title: string;
  notes: string | null;
  paidById: string;
  paidByName: string;
  paymentMode: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET" | "OTHER";
  amountMinor: number;
  currency: string;
};

type SettlementView = {
  id: string;
  fromUserName: string;
  toUserName: string;
  amountMinor: number;
};

type VisitedPlaceView = {
  id: string;
  tripId: string;
  name: string;
  category: "ATTRACTION" | "FOOD" | "STAY" | "SHOPPING" | "OTHER";
  visitedAt: string;
  dayNumber: number | null;
  tags: string[];
  rating: number | null;
  notes: string | null;
  visitors: Array<{ id: string; name: string; avatar: string | null }>;
  ratings: Array<{ userId: string; userName: string; rating: number }>;
  media: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
};

export function TripWorkspaceTabs({
  trip,
  currentUserId,
  participants,
  expenses,
  settlements,
  visitedPlaces,
}: {
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
    invites: Array<{
      id: string;
      token: string;
      usedCount: number;
      maxUses: number | null;
      expiresAt: string | null;
      isActive: boolean;
    }>;
    joinRequests: Array<{
      id: string;
      requesterId: string;
      requesterName: string;
      requesterAvatar: string | null;
      createdAt: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
    }>;
  };
  currentUserId?: string;
  participants: ParticipantView[];
  expenses: ExpenseView[];
  settlements: SettlementView[];
  visitedPlaces: VisitedPlaceView[];
}) {
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
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [expensePaidById, setExpensePaidById] = useState("");
  const [expensePaymentMode, setExpensePaymentMode] = useState<
    "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET" | "OTHER"
  >("CASH");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalSpendMinor = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amountMinor, 0),
    [expenses],
  );

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
      toast.success("Trip details updated.");
    });
  };

  const recalculateSettlement = () => {
    startTransition(async () => {
      const result = await generateSettlementAction({ tripId: trip.id });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to recalculate settlement.");
        return;
      }
      toast.success("Settlement recalculated.");
    });
  };

  const selectedParticipant = participants.find((participant) => participant.id === selectedUserId) ?? null;
  const selectedExpense = expenses.find((expense) => expense.id === selectedExpenseId) ?? null;

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
        tripId: trip.id,
        userId,
        customLabel,
      });

      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to assign custom tag.");
        return;
      }

      toast.success("Custom tag assigned.");
      setTagInput("");
      setIsTagModalOpen(false);
    });
  };

  const openExpenseModal = (expenseId: string) => {
    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) return;
    setSelectedExpenseId(expenseId);
    setExpenseTitle(expense.title);
    setExpenseNotes(expense.notes ?? "");
    setExpensePaidById(expense.paidById);
    setExpensePaymentMode(expense.paymentMode);
    setIsExpenseModalOpen(true);
  };

  const saveExpense = () => {
    if (!selectedExpenseId) return;
    startTransition(async () => {
      const result = await updateExpenseAction({
        expenseId: selectedExpenseId,
        tripId: trip.id,
        title: expenseTitle,
        notes: expenseNotes,
        paidById: expensePaidById,
        paymentMode: expensePaymentMode,
      });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to update expense.");
        return;
      }
      toast.success("Expense updated.");
      setIsExpenseModalOpen(false);
    });
  };

  const removeExpense = (expenseId: string) => {
    startTransition(async () => {
      const result = await deleteExpenseAction({ expenseId, tripId: trip.id });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to delete expense.");
        return;
      }
      toast.success("Expense deleted.");
    });
  };

  const settleItem = (settlementId: string) => {
    startTransition(async () => {
      const result = await settleSettlementAction({ settlementId, tripId: trip.id });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to settle.");
        return;
      }
      toast.success("Marked as settled.");
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

  return (
    <Tabs defaultValue="trip-detail" className="grid gap-4">
      <TabsList variant="line" className="w-full justify-start">
        <TabsTrigger value="trip-detail">Trip Detail</TabsTrigger>
        <TabsTrigger value="user-information">User Information</TabsTrigger>
        <TabsTrigger value="expense-manager">Expense Manager</TabsTrigger>
        <TabsTrigger value="visited-places">Visited Places</TabsTrigger>
      </TabsList>

      <TabsContent value="trip-detail">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="workspace-trip-title">Trip Title</Label>
                <Input
                  id="workspace-trip-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Trip title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workspace-trip-description">Description</Label>
                <Textarea
                  id="workspace-trip-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Trip description"
                />
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
                  <Label htmlFor="workspace-start-point">Start Point</Label>
                  <Input
                    id="workspace-start-point"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    placeholder="e.g. Chennai"
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
                  <Label htmlFor="workspace-transport-notes">Transport Notes</Label>
                  <Input
                    id="workspace-transport-notes"
                    value={transportNotes}
                    onChange={(e) => setTransportNotes(e.target.value)}
                    placeholder="Optional details"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="workspace-trip-start">Start Date</Label>
                  <Input
                    id="workspace-trip-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workspace-trip-end">End Date</Label>
                  <Input
                    id="workspace-trip-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button disabled={isPending || title.trim().length === 0} onClick={saveTripDetails} type="button">
                {isPending ? "Saving..." : "Save Trip Details"}
              </Button>
             
              <InviteManager tripId={trip.id} invites={trip.invites} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-2">
              <div>
                {currentUserId === trip.createdById && (
                  <div className="grid gap-2 rounded border p-3">
                    <div className="text-sm font-medium">Join Requests</div>
                    {trip.joinRequests.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No pending requests.</div>
                    ) : (
                      trip.joinRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between gap-2 rounded border p-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={request.requesterAvatar || DEFAULT_USER_AVATAR_URL}
                              alt={request.requesterName}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            <div className="text-sm">
                              {request.requesterName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Pending</Badge>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => reviewJoinRequest(request.id, "APPROVED")}
                              disabled={isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => reviewJoinRequest(request.id, "REJECTED")}
                              disabled={isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="rounded border p-3">
                <div className="text-xs text-muted-foreground">Participants</div>
                <div className="text-lg font-semibold">{participants.length}</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-xs text-muted-foreground">Expenses</div>
                <div className="text-lg font-semibold">{expenses.length}</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-xs text-muted-foreground">Total Spend</div>
                <div className="text-lg font-semibold">{formatCurrency(totalSpendMinor)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="user-information">
        <Card>
          <CardHeader>
            <CardTitle>Participants & Tags</CardTitle>
            <CardDescription>
              Add custom tags directly under each user.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {participants.map((participant) => (
              <div key={participant.id} className="grid gap-3 rounded border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={participant.avatar || DEFAULT_USER_AVATAR_URL}
                      alt={participant.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="font-medium">{participant.name}</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openTagModal(participant.id)}
                    aria-label={`Edit tags for ${participant.name}`}
                  >
                    <PencilSimpleIcon />
                  </Button>
                </div>
                <div className="flex min-h-7 flex-wrap gap-1">
                  {participant.tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No tags assigned</span>
                  ) : (
                    participant.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.label}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Tags</DialogTitle>
              <DialogDescription>
                {selectedParticipant ? `Add a custom tag for ${selectedParticipant.name}.` : "Select a user."}
              </DialogDescription>
            </DialogHeader>

            {selectedParticipant && (
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedParticipant.avatar || DEFAULT_USER_AVATAR_URL}
                    alt={selectedParticipant.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="font-medium">{selectedParticipant.name}</div>
                </div>
                <div className="flex min-h-7 flex-wrap gap-1">
                  {selectedParticipant.tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No tags assigned</span>
                  ) : (
                    selectedParticipant.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.label}
                      </Badge>
                    ))
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tag-input">Custom Tag</Label>
                  <Input
                    id="tag-input"
                    placeholder="Add custom tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                </div>
              </div>
            )}

            <DialogFooter showCloseButton>
              <Button
                type="button"
                onClick={() => selectedParticipant && assignCustomTagForUser(selectedParticipant.id)}
                disabled={isPending || !selectedParticipant || !tagInput.trim()}
              >
                Add Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="expense-manager">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Information</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="rounded border border-dashed p-4 text-sm text-muted-foreground">
                    No expenses added yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Paid By</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.title}</TableCell>
                          <TableCell>{expense.paidByName}</TableCell>
                          <TableCell>{expense.paymentMode.replace("_", " ")}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(expense.amountMinor, expense.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-1">
                              <Button size="icon-sm" variant="ghost" onClick={() => openExpenseModal(expense.id)}>
                                <PencilSimpleIcon />
                              </Button>
                              <Button size="icon-sm" variant="ghost" onClick={() => removeExpense(expense.id)}>
                                <TrashIcon />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader>
                <div className="flex items-center justify-between">


                  <CardTitle>Settlement Summary</CardTitle>
                  <Button variant="default" type="button" onClick={recalculateSettlement} disabled={isPending}>
                    Recalculate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {settlements.length === 0 ? (
                  <div className="rounded border border-dashed p-4 text-sm text-muted-foreground">
                    No settlements available. Recalculate after adding expenses.
                  </div>
                ) : (
                  <ul className="grid gap-2">
                    {settlements.map((settlement) => (
                      <li key={settlement.id} className="rounded border p-3 text-sm">
                        <span className="font-semibold">{settlement.fromUserName}</span> pays{" "}
                        <span className="font-semibold">{settlement.toUserName}</span>{" "}
                        <span className="font-semibold">{formatCurrency(settlement.amountMinor)}</span>{" "}
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => settleItem(settlement.id)}
                          disabled={isPending}
                        >
                          Settled
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add Expense</CardTitle>
              <CardDescription>Create and split a new expense.</CardDescription>
            </CardHeader>
            <CardContent>
              <AddExpenseForm
                tripId={trip.id}
                defaultPaidById={currentUserId}
                users={participants.map((participant) => ({
                  id: participant.id,
                  name: participant.name,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="visited-places">
        <VisitedPlacesPanel
          tripId={trip.id}
          addedById={trip.createdById}
          currentUserId={currentUserId}
          participants={participants.map((p) => ({ id: p.id, name: p.name }))}
          expenses={expenses.map((e) => ({ id: e.id, title: e.title }))}
          places={visitedPlaces}
        />
      </TabsContent>

      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update expense details.</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Paid By</Label>
                <Select value={expensePaidById} onValueChange={setExpensePaidById}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
                <Label>Mode of Payment</Label>
                <Select value={expensePaymentMode} onValueChange={(v) => setExpensePaymentMode(v as typeof expensePaymentMode)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea value={expenseNotes} onChange={(e) => setExpenseNotes(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter showCloseButton>
            <Button onClick={saveExpense} disabled={isPending || !expenseTitle.trim() || !expensePaidById}>
              {isPending ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
