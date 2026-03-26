"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createExpenseAction, computeSplitAction } from "@/lib/actions/expenses";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export function AddExpenseForm({
  tripId,
  users,
  defaultPaidById,
}: {
  tripId: string;
  users: UserOption[];
  defaultPaidById?: string;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState(
    defaultPaidById && users.some((user) => user.id === defaultPaidById) ? defaultPaidById : (users[0]?.id ?? ""),
  );
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [participantIds, setParticipantIds] = useState<string[]>(users.map((user) => user.id));
  const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [previewRows, setPreviewRows] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const amountMinor = useMemo(() => Math.round(Number(amount || 0) * 100), [amount]);

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
        amountMinor,
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
          return `${name}: ${formatCurrency(row.amountMinor)}`;
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
        amountMinor,
        paidById,
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
    });
  };

  return (
    <div className="grid gap-4">
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
        <Label>Split type</Label>
        <Select value={splitType} onValueChange={(value) => setSplitType(value as SplitType)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EQUAL">Equal</SelectItem>
            <SelectItem value="EXACT_AMOUNT">Exact Amount</SelectItem>
            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
            <SelectItem value="SHARES">Shares</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Participants</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-2 rounded border p-2">
              <Checkbox
                checked={participantIds.includes(user.id)}
                onCheckedChange={() => toggleParticipant(user.id)}
              />
              <span className="text-sm">{user.name}</span>
            </div>
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
              <div key={userId} className="grid gap-1">
                <Label>{user.name}</Label>
                <Input
                  type="number"
                  step={splitType === "SHARES" ? "1" : "0.01"}
                  min="0"
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
