type Ledger = {
  userId: string;
  paidMinor: number;
  owedMinor: number;
};

export type SettlementInstruction = {
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
};

export function generateSettlement(ledger: Ledger[]): SettlementInstruction[] {
  const creditors: Array<{ userId: string; amount: number }> = [];
  const debtors: Array<{ userId: string; amount: number }> = [];

  for (const row of ledger) {
    const net = row.paidMinor - row.owedMinor;
    if (net > 0) creditors.push({ userId: row.userId, amount: net });
    if (net < 0) debtors.push({ userId: row.userId, amount: -net });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const instructions: SettlementInstruction[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const transfer = Math.min(debtor.amount, creditor.amount);

    if (transfer > 0) {
      instructions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amountMinor: transfer,
      });
    }

    debtor.amount -= transfer;
    creditor.amount -= transfer;

    if (debtor.amount === 0) d += 1;
    if (creditor.amount === 0) c += 1;
  }

  return instructions;
}
