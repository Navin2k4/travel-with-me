"use client";

import { useMemo, useState, useTransition } from "react";
import { InfoIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AddExpenseForm } from "@/components/expenses/add-expense-form";
import { VisitedPlacesPanel } from "@/components/places/visited-places-panel";
import { InviteManager } from "@/components/trips/invite-manager";
import { TripDashboardTab } from "@/components/trips/trip-dashboard-tab";
import { TripDetailTab } from "@/components/trips/trip-detail-tab";
import { TripUserInformationTab } from "@/components/trips/trip-user-information-tab";
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
  revokeSettlementAction,
  settleSettlementAction,
  updateExpenseAction,
} from "@/lib/actions/expenses";
import { assignParticipantTagAction, reviewJoinRequestAction, updateTripAction } from "@/lib/actions/trips";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { placeCategoryLabel, type PlaceCategory } from "@/lib/places/place-categories";

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
  splitType: "EQUAL" | "EXACT_AMOUNT" | "PERCENTAGE" | "SHARES";
  paymentMode: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET" | "OTHER";
  category:
  | "FOOD"
  | "TRANSPORT"
  | "FUEL"
  | "TOLL_PARKING"
  | "LODGING"
  | "FLIGHT"
  | "TRAIN_BUS"
  | "LOCAL_TRAVEL"
  | "VISA"
  | "INSURANCE"
  | "ACTIVITY_TICKETS"
  | "GUIDE_TIPS"
  | "MEDICAL"
  | "COMMUNICATION"
  | "ENTERTAINMENT"
  | "SHOPPING"
  | "UTILITIES"
  | "OTHER";
  customCategory: string | null;
  amount: number;
  currency: string;
  splits: Array<{
    userName: string;
    amount: number;
    percentageBp: number | null;
    shares: number | null;
  }>;
};

type SettlementView = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  amount: number;
  isSettled: boolean;
  settledAt: string | null;
};

type VisitedPlaceView = {
  id: string;
  tripId: string;
  name: string;
  category: PlaceCategory;
  visitedAt: string;
  dayNumber: number | null;
  tags: string[];
  rating: number | null;
  notes: string | null;
  locationUrl: string | null;
  visitors: Array<{ id: string; name: string; avatar: string | null }>;
  ratings: Array<{ userId: string; userName: string; rating: number }>;
  media: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
};

export function TripWorkspaceTabs({
  trip,
  currentUserId,
  customExpenseCategories,
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
  customExpenseCategories: string[];
  participants: ParticipantView[];
  expenses: ExpenseView[];
  settlements: SettlementView[];
  visitedPlaces: VisitedPlaceView[];
}) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [infoExpenseId, setInfoExpenseId] = useState<string | null>(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [expensePaidById, setExpensePaidById] = useState("");
  const [expensePaymentMode, setExpensePaymentMode] = useState<
    "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET" | "OTHER"
  >("CASH");
  const [expenseCategory, setExpenseCategory] = useState<
    | "FOOD"
    | "TRANSPORT"
    | "FUEL"
    | "TOLL_PARKING"
    | "LODGING"
    | "FLIGHT"
    | "TRAIN_BUS"
    | "LOCAL_TRAVEL"
    | "VISA"
    | "INSURANCE"
    | "ACTIVITY_TICKETS"
    | "GUIDE_TIPS"
    | "MEDICAL"
    | "COMMUNICATION"
    | "ENTERTAINMENT"
    | "SHOPPING"
    | "UTILITIES"
    | "OTHER"
  >("OTHER");
  const [expenseCustomCategory, setExpenseCustomCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalSpend = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );
  const totalVisitedPlaces = visitedPlaces.length;
  const averagePlaceRating = useMemo(() => {
    const withRating = visitedPlaces.filter((place) => typeof place.rating === "number");
    if (withRating.length === 0) return null;
    return withRating.reduce((sum, place) => sum + (place.rating ?? 0), 0) / withRating.length;
  }, [visitedPlaces]);
  const expenseByCategory = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number; sub: Map<string, { total: number; count: number }> }>();
    for (const expense of expenses) {
      const categoryLabel = expense.category.replace("_", " ");
      if (!grouped.has(categoryLabel)) {
        grouped.set(categoryLabel, { total: 0, count: 0, sub: new Map() });
      }
      const categoryBucket = grouped.get(categoryLabel)!;
      categoryBucket.total += expense.amount;
      categoryBucket.count += 1;

      const subCategory = expense.customCategory?.trim();
      if (subCategory) {
        const existing = categoryBucket.sub.get(subCategory) ?? { total: 0, count: 0 };
        existing.total += expense.amount;
        existing.count += 1;
        categoryBucket.sub.set(subCategory, existing);
      }
    }
    return [...grouped.entries()]
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        subcategories: [...data.sub.entries()]
          .map(([name, sub]) => ({ name, total: sub.total, count: sub.count }))
          .sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);
  const timelinePlaces = useMemo(
    () =>
      [...visitedPlaces].sort(
        (a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime(),
      ),
    [visitedPlaces],
  );
  const settlementParticipants = useMemo(() => {
    const byId = new Map(participants.map((p) => [p.id, p.name]));
    return participants.map((p) => ({ id: p.id, name: byId.get(p.id) ?? p.name }));
  }, [participants]);
  const settlementMatrix = useMemo(() => {
    const matrix = new Map<string, Map<string, number>>();
    for (const row of settlements) {
      if (row.isSettled) continue;
      if (!matrix.has(row.fromUserId)) matrix.set(row.fromUserId, new Map());
      const fromRow = matrix.get(row.fromUserId)!;
      fromRow.set(row.toUserId, (fromRow.get(row.toUserId) ?? 0) + row.amount);
    }
    return matrix;
  }, [settlements]);
  const settlementRowTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const payer of settlementParticipants) {
      const row = settlementMatrix.get(payer.id);
      totals.set(payer.id, row ? [...row.values()].reduce((sum, value) => sum + value, 0) : 0);
    }
    return totals;
  }, [settlementMatrix, settlementParticipants]);
  const settlementColumnTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const receiver of settlementParticipants) totals.set(receiver.id, 0);
    for (const payer of settlementParticipants) {
      const row = settlementMatrix.get(payer.id);
      if (!row) continue;
      for (const receiver of settlementParticipants) {
        totals.set(receiver.id, (totals.get(receiver.id) ?? 0) + (row.get(receiver.id) ?? 0));
      }
    }
    return totals;
  }, [settlementMatrix, settlementParticipants]);
  const spendByPerson = useMemo(() => {
    const totals = new Map<string, number>();
    for (const participant of participants) totals.set(participant.id, 0);
    for (const expense of expenses) {
      totals.set(expense.paidById, (totals.get(expense.paidById) ?? 0) + expense.amount);
    }
    return participants
      .map((participant) => ({
        id: participant.id,
        name: participant.name,
        amount: totals.get(participant.id) ?? 0,
      }))
      .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
  }, [expenses, participants]);

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

  const selectedExpense = expenses.find((expense) => expense.id === selectedExpenseId) ?? null;
  const infoExpense = expenses.find((expense) => expense.id === infoExpenseId) ?? null;
  const splitTypeMeta: Record<ExpenseView["splitType"], { label: string }> = {
    EQUAL: { label: "Equal Split" },
    EXACT_AMOUNT: { label: "Exact Amount" },
    PERCENTAGE: { label: "Percentage" },
    SHARES: { label: "Shares" },
  };


  const openExpenseModal = (expenseId: string) => {
    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) return;
    setSelectedExpenseId(expenseId);
    setExpenseTitle(expense.title);
    setExpenseNotes(expense.notes ?? "");
    setExpensePaidById(expense.paidById);
    setExpensePaymentMode(expense.paymentMode);
    setExpenseCategory(expense.category);
    setExpenseCustomCategory(expense.customCategory ?? "");
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
        category: expenseCategory,
        customCategory: expenseCustomCategory,
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

  const revokeSettlement = (settlementId: string) => {
    startTransition(async () => {
      const result = await revokeSettlementAction({ settlementId, tripId: trip.id });
      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to revoke settlement.");
        return;
      }
      toast.success("Settlement reopened.");
    });
  };

  return (
    <Tabs defaultValue="overall-summary" className="grid gap-4">
      <TabsList variant="line" className="w-full justify-start">
        <TabsTrigger value="overall-summary">Overall Trip Summary</TabsTrigger>
        <TabsTrigger value="trip-detail">Trip Detail</TabsTrigger>
        <TabsTrigger value="user-information">User Information</TabsTrigger>
        <TabsTrigger value="expense-manager">Expense Manager</TabsTrigger>
        <TabsTrigger value="visited-places">Visited Places</TabsTrigger>
      </TabsList>

      <TabsContent value="overall-summary">
        <TripDashboardTab
          trip={{
            id: trip.id,
            title: trip.title,
            description: trip.description,
            coverImage: trip.coverImage,
            status: trip.status,
            startPoint: trip.startPoint,
            dateFlexibility: trip.dateFlexibility,
            transportMode: trip.transportMode,
            transportNotes: trip.transportNotes,
            startDate: trip.startDate,
            endDate: trip.endDate,
          }}
          participants={participants}
          expenses={expenses}
          totalSpend={totalSpend}
          expenseByCategory={expenseByCategory}
          totalVisitedPlaces={totalVisitedPlaces}
          averagePlaceRating={averagePlaceRating}
          timelinePlaces={timelinePlaces}
        />
      </TabsContent>

      <TabsContent value="trip-detail">
        <TripDetailTab
          trip={trip}
          currentUserId={currentUserId}
          participantsCount={participants.length}
          expensesCount={expenses.length}
          totalSpend={totalSpend}
        />
      </TabsContent>

      <TabsContent value="user-information">
        <TripUserInformationTab tripId={trip.id} participants={participants} />
      </TabsContent>

      <TabsContent value="expense-manager">
        <div className="grid gap-4 rounded-xl">
          <div className="grid gap-4">
            <Card className="border-violet-200/70 bg-white/90 shadow-sm">
              <CardHeader className="rounded-t-lg ">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-violet-900">Expense Information</CardTitle>
                  <Button type="button" onClick={() => setIsAddExpenseModalOpen(true)}>
                    Add Expense
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="rounded border border-dashed p-4 text-sm text-muted-foreground">
                    No expenses added yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-violet-100/70 hover:bg-violet-100/70">
                        <TableHead>Title</TableHead>
                        <TableHead>Paid By</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Split</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id} className="odd:bg-white even:bg-violet-50/30">
                          <TableCell>{expense.title}</TableCell>
                          <TableCell>{expense.paidByName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-violet-100 text-violet-900">
                              {expense.customCategory?.trim() || expense.category.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{expense.paymentMode.replace("_", " ")}</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">{splitTypeMeta[expense.splitType].label}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(expense.amount, expense.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-1">
                              <Button size="icon-sm" variant="ghost" onClick={() => openExpenseModal(expense.id)}>
                                <PencilSimpleIcon />
                              </Button>
                              <Button size="icon-sm" variant="ghost" onClick={() => setInfoExpenseId(expense.id)}>
                                <InfoIcon />
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

            <Card className="border-cyan-200/70 bg-white/90 shadow-sm">
              <CardHeader className="rounded-t-lg">
                <div className="flex items-center justify-between">


                  <CardTitle className="text-cyan-900">Settlement Summary</CardTitle>
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
                  <>
                    <div className="overflow-x-auto rounded border border-cyan-200/70 bg-cyan-50/30">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-cyan-100/70 hover:bg-cyan-100/70">
                            <TableHead className="min-w-32">Payer \ Receiver</TableHead>
                            {settlementParticipants.map((receiver) => (
                              <TableHead key={`receiver-${receiver.id}`} className="text-right">
                                {receiver.name}
                              </TableHead>
                            ))}
                            <TableHead className="text-right">Row Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {settlementParticipants.map((payer) => (
                            <TableRow key={`payer-${payer.id}`} className="odd:bg-white even:bg-cyan-50/30">
                              <TableCell className="font-medium">{payer.name}</TableCell>
                              {settlementParticipants.map((receiver) => {
                                const amount = settlementMatrix.get(payer.id)?.get(receiver.id) ?? 0;
                                return (
                                  <TableCell key={`${payer.id}-${receiver.id}`} className="text-right text-sm">
                                    {amount > 0 ? formatCurrency(amount) : "—"}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(settlementRowTotals.get(payer.id) ?? 0)}
                              </TableCell>
                            </TableRow>
                          ))}

                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid gap-2">
                      {settlements.map((settlement) => (
                        <div
                          key={settlement.id}
                          className={`flex items-center justify-between rounded border border-cyan-200/70 p-2 text-sm ${settlement.isSettled ? "border-emerald-200/80 bg-emerald-50/50" : "bg-white"
                            }`}
                        >
                          <span className={settlement.isSettled ? "text-muted-foreground" : ""}>
                            <span className="font-semibold text-foreground">{settlement.fromUserName}</span> pays{" "}
                            <span className="font-semibold text-foreground">{settlement.toUserName}</span>{" "}
                            <span className="font-semibold text-foreground">{formatCurrency(settlement.amount)}</span>
                            {settlement.isSettled ? (
                              <Badge variant="secondary" className="ml-2 align-middle">
                                Settled
                              </Badge>
                            ) : null}
                          </span>
                          {settlement.isSettled ? (
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => revokeSettlement(settlement.id)}
                              disabled={isPending}
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => settleItem(settlement.id)}
                              disabled={isPending}
                            >
                              Mark settled
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="rounded border border-emerald-200/70 bg-emerald-50/40 p-3">
                  <div className="mb-2 text-sm font-medium text-emerald-900">Per Person Spend Overview</div>
                  <div className="grid gap-1">
                    {spendByPerson.map((person) => (
                      <div key={person.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{person.name}</span>
                        <span className="font-medium">{formatCurrency(person.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <Dialog open={isAddExpenseModalOpen} onOpenChange={setIsAddExpenseModalOpen}>
        <DialogContent className="min-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Create and split a new expense.</DialogDescription>
          </DialogHeader>
          <AddExpenseForm
            tripId={trip.id}
            defaultPaidById={currentUserId}
            customCategorySuggestions={customExpenseCategories}
            users={participants.map((participant) => ({
              id: participant.id,
              name: participant.name,
            }))}
          />
        </DialogContent>
      </Dialog>

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
                <Label>Category</Label>
                <Select value={expenseCategory} onValueChange={(v) => setExpenseCategory(v as typeof expenseCategory)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOOD">Food</SelectItem>
                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                    <SelectItem value="FUEL">Fuel</SelectItem>
                    <SelectItem value="TOLL_PARKING">Toll & Parking</SelectItem>
                    <SelectItem value="LODGING">Lodging</SelectItem>
                    <SelectItem value="FLIGHT">Flight</SelectItem>
                    <SelectItem value="TRAIN_BUS">Train / Bus</SelectItem>
                    <SelectItem value="LOCAL_TRAVEL">Local Travel</SelectItem>
                    <SelectItem value="VISA">Visa</SelectItem>
                    <SelectItem value="INSURANCE">Insurance</SelectItem>
                    <SelectItem value="ACTIVITY_TICKETS">Activity Tickets</SelectItem>
                    <SelectItem value="GUIDE_TIPS">Guide / Tips</SelectItem>
                    <SelectItem value="MEDICAL">Medical</SelectItem>
                    <SelectItem value="COMMUNICATION">Communication</SelectItem>
                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                    <SelectItem value="SHOPPING">Shopping</SelectItem>
                    <SelectItem value="UTILITIES">Utilities</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Custom Category</Label>
                <Input
                  value={expenseCustomCategory}
                  onChange={(e) => setExpenseCustomCategory(e.target.value)}
                  placeholder="e.g. Visa, Tickets, SIM"
                  list="expense-custom-category-suggestions"
                />
                {customExpenseCategories.length > 0 ? (
                  <datalist id="expense-custom-category-suggestions">
                    {customExpenseCategories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                ) : null}
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

      <Dialog open={Boolean(infoExpense)} onOpenChange={(open) => !open && setInfoExpenseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>Complete information and split details.</DialogDescription>
          </DialogHeader>
          {infoExpense ? (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Title:</span> {infoExpense.title}</div>
                <div><span className="text-muted-foreground">Paid by:</span> {infoExpense.paidByName}</div>
                <div><span className="text-muted-foreground">Category:</span> {infoExpense.customCategory?.trim() || infoExpense.category.replace("_", " ")}</div>
                <div><span className="text-muted-foreground">Payment:</span> {infoExpense.paymentMode.replace("_", " ")}</div>
                <div><span className="text-muted-foreground">Split type:</span> {infoExpense.splitType.replace("_", " ")}</div>
                <div><span className="text-muted-foreground">Amount:</span> {formatCurrency(infoExpense.amount, infoExpense.currency)}</div>
              </div>
              {infoExpense.notes ? (
                <div className="rounded border p-2">
                  <div className="text-muted-foreground">Notes</div>
                  <div>{infoExpense.notes}</div>
                </div>
              ) : null}
              <div className="rounded border p-2">
                <div className="mb-1 text-muted-foreground">Split details</div>
                <ul className="grid gap-1">
                  {infoExpense.splits.map((split, index) => (
                    <li key={`${infoExpense.id}-${index}`} className="flex items-center justify-between gap-2">
                      <span>{split.userName}</span>
                      <span className="text-right">
                        {formatCurrency(split.amount, infoExpense.currency)}
                        {split.percentageBp != null ? ` (${(split.percentageBp / 100).toFixed(2)}%)` : ""}
                        {split.shares != null ? ` (${split.shares} shares)` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
