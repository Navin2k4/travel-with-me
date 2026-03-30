"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createExpenseAction, computeSplitAction } from "@/lib/actions/expenses";
import { formatCurrencyFromMinorUnits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserOption = {
  id: string;
  name: string;
};

type SplitType = "EQUAL" | "EXACT_AMOUNT" | "PERCENTAGE" | "SHARES";
type ExpenseCategory =
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

export function AddExpenseForm({
  tripId,
  users,
  defaultPaidById,
  customCategorySuggestions,
}: {
  tripId: string;
  users: UserOption[];
  defaultPaidById?: string;
  customCategorySuggestions?: string[];
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState(
    defaultPaidById && users.some((user) => user.id === defaultPaidById) ? defaultPaidById : (users[0]?.id ?? ""),
  );
  const [paymentMode, setPaymentMode] = useState<"CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET" | "OTHER">("CASH");
  const [category, setCategory] = useState<ExpenseCategory>("OTHER");
  const [customCategory, setCustomCategory] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [participantIds, setParticipantIds] = useState<string[]>(users.map((user) => user.id));
  const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [previewRows, setPreviewRows] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const amountMajor = useMemo(() => Number(amount || 0), [amount]);

  const setSplitValue = (userId: string, value: string) => {
    const numeric = Number(value);
    setSplitDetails((current) => ({ ...current, [userId]: Number.isFinite(numeric) ? numeric : 0 }));
  };

  const toggleParticipant = (userId: string) => {
    setParticipantIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const handlePreview = () => {
    startTransition(async () => {
      const result = await computeSplitAction({
        amount: amountMajor,
        splitType,
        participantIds,
        splitDetails,
      });

      if (!result.ok) {
        setPreviewRows([typeof result.error === "string" ? result.error : "Unable to compute split."]);
        setIsPreviewOpen(true);
        return;
      }

      const mapped = result.data
        .map((row) => {
          const name = users.find((user) => user.id === row.userId)?.name ?? row.userId;
          return `${name}: ${formatCurrencyFromMinorUnits(row.amountMinor)}`;
        });

      setPreviewRows(mapped);
      setIsPreviewOpen(true);
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createExpenseAction({
        tripId,
        title,
        amount: amountMajor,
        paidById,
        paymentMode,
        category,
        customCategory,
        participantIds,
        splitType,
        splitDetails,
      });

      if (!result.ok) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to add expense.");
        return;
      }

      toast.success("Expense added.");
      setTitle("");
      setAmount("");
      setSplitDetails({});
      setPreviewRows([]);
      setIsPreviewOpen(false);
      setPaymentMode("CASH");
      setCategory("OTHER");
      setCustomCategory("");
    });
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border bg-muted/20 p-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="grid gap-2">
            <Label htmlFor="expense-title">Expense title</Label>
            <Input
              id="expense-title"
              placeholder="Dinner / Cab / Hotel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expense-amount">Amount</Label>
            <Input
              id="expense-amount"
              placeholder="Amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Paid by</Label>
            <Select value={paidById} onValueChange={setPaidById}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Mode of Payment</Label>
            <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as typeof paymentMode)}>
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
            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
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
            <Label htmlFor="expense-custom-category">Custom category</Label>
            <Input
              id="expense-custom-category"
              placeholder="e.g. Visa, Tickets, SIM"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              list="trip-custom-category-suggestions"
            />
            {(customCategorySuggestions?.length ?? 0) > 0 ? (
              <datalist id="trip-custom-category-suggestions">
                {customCategorySuggestions?.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Split type</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "EQUAL", label: "Equal" },
            { value: "EXACT_AMOUNT", label: "Exact Amount" },
            { value: "PERCENTAGE", label: "Percentage" },
            { value: "SHARES", label: "Shares" },
          ].map((option) => {
            const isActive = splitType === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => setSplitType(option.value as SplitType)}
              >
                {option.label}
                {isActive ? <Badge className="ml-2 bg-background/20 text-[10px] text-current">Selected</Badge> : null}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Participants</Label>
        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <Button
              key={user.id}
              type="button"
              variant={participantIds.includes(user.id) ? "default" : "outline"}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => toggleParticipant(user.id)}
            >
              {user.name}
            </Button>
          ))}
        </div>
      </div>

      {splitType !== "EQUAL" && (
        <div className="grid gap-2 rounded border p-3">
          <div className="text-sm font-medium">
            {splitType === "EXACT_AMOUNT" && "Exact amount per participant"}
            {splitType === "PERCENTAGE" && "Percentage per participant (total = 100)"}
            {splitType === "SHARES" && "Shares per participant (1,2,3...)"}
          </div>
          {participantIds.map((userId) => {
            const user = users.find((item) => item.id === userId);
            if (!user) return null;
            return (
              <div key={userId} className="grid grid-cols-[minmax(120px,1fr)_auto_140px] items-center gap-2">
                <Label className="truncate">{user.name}</Label>
                <span className="text-muted-foreground">:</span>
                <Input
                  type="number"
                  step={splitType === "SHARES" ? "1" : "0.01"}
                  min="0"
                  className="h-8"
                  value={splitDetails[userId] ?? ""}
                  onChange={(e) => setSplitValue(userId, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" type="button" disabled={isPending} onClick={handlePreview}>
          Preview Split
        </Button>
        <Button className="flex-1" type="button" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Saving..." : "Add Expense"}
        </Button>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Split Preview</DialogTitle>
            <DialogDescription>Review how this expense will be split before saving.</DialogDescription>
          </DialogHeader>
          <div className="rounded border bg-muted p-3 text-sm">
            {previewRows.length === 0 ? (
              "No preview available."
            ) : (
              <ol className="space-y-1 pl-5">
                {previewRows.map((row) => (
                  <li key={row}>{row}</li>
                ))}
              </ol>
            )}
          </div>
          <DialogFooter showCloseButton>
            <Button type="button" variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
