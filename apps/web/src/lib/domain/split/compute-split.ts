export type SplitType = "EQUAL" | "EXACT_AMOUNT" | "PERCENTAGE" | "SHARES";

export type SplitRow = {
  userId: string;
  amountMinor: number;
  percentageBp?: number;
  shares?: number;
};

type ComputeSplitInput = {
  amountMinor: number;
  splitType: SplitType;
  participantIds: string[];
  splitDetails?: Record<string, number>;
};

export function computeSplit(input: ComputeSplitInput): SplitRow[] {
  const { amountMinor, splitType, participantIds, splitDetails = {} } = input;

  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error("Amount must be a positive integer in minor units.");
  }
  if (participantIds.length === 0) {
    throw new Error("At least one participant is required.");
  }

  switch (splitType) {
    case "EQUAL":
      return equalSplit(amountMinor, participantIds);
    case "EXACT_AMOUNT":
      return exactSplit(amountMinor, participantIds, splitDetails);
    case "PERCENTAGE":
      return percentageSplit(amountMinor, participantIds, splitDetails);
    case "SHARES":
      return sharesSplit(amountMinor, participantIds, splitDetails);
    default:
      throw new Error("Unsupported split type.");
  }
}

function equalSplit(amountMinor: number, participantIds: string[]): SplitRow[] {
  const base = Math.floor(amountMinor / participantIds.length);
  let remainder = amountMinor % participantIds.length;

  return participantIds.map((userId) => {
    const amount = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return { userId, amountMinor: amount };
  });
}

function exactSplit(
  amountMinor: number,
  participantIds: string[],
  splitDetails: Record<string, number>,
): SplitRow[] {
  const rows = participantIds.map((userId) => {
    const value = splitDetails[userId] ?? 0;
    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Exact amounts must be non-negative numbers.");
    }
    return { userId, amountMinor: Math.round(value) };
  });

  const total = rows.reduce((sum, row) => sum + row.amountMinor, 0);
  if (total !== amountMinor) {
    throw new Error("Exact split amounts must sum to total amount.");
  }
  return rows;
}

function percentageSplit(
  amountMinor: number,
  participantIds: string[],
  splitDetails: Record<string, number>,
): SplitRow[] {
  const withBp = participantIds.map((userId) => {
    const percentage = splitDetails[userId] ?? 0;
    if (!Number.isFinite(percentage) || percentage < 0) {
      throw new Error("Percentages must be non-negative numbers.");
    }
    return { userId, percentageBp: Math.round(percentage * 100) };
  });

  const totalBp = withBp.reduce((sum, item) => sum + item.percentageBp, 0);
  if (totalBp !== 10000) {
    throw new Error("Percentages must total exactly 100.");
  }

  const raw = withBp.map((item) => {
    const exact = (amountMinor * item.percentageBp) / 10000;
    const floor = Math.floor(exact);
    return { ...item, floor, frac: exact - floor };
  });

  let remainder = amountMinor - raw.reduce((sum, row) => sum + row.floor, 0);
  const sorted = [...raw].sort((a, b) => b.frac - a.frac);
  const bonusUsers = new Set(sorted.slice(0, remainder).map((row) => row.userId));

  return raw.map((row) => ({
    userId: row.userId,
    amountMinor: row.floor + (bonusUsers.has(row.userId) ? 1 : 0),
    percentageBp: row.percentageBp,
  }));
}

function sharesSplit(
  amountMinor: number,
  participantIds: string[],
  splitDetails: Record<string, number>,
): SplitRow[] {
  const withShares = participantIds.map((userId) => {
    const shares = splitDetails[userId] ?? 0;
    if (!Number.isFinite(shares) || shares < 0) {
      throw new Error("Shares must be non-negative numbers.");
    }
    return { userId, shares: Math.round(shares) };
  });

  const totalShares = withShares.reduce((sum, item) => sum + item.shares, 0);
  if (totalShares <= 0) {
    throw new Error("Total shares must be greater than zero.");
  }

  const raw = withShares.map((item) => {
    const exact = (amountMinor * item.shares) / totalShares;
    const floor = Math.floor(exact);
    return { ...item, floor, frac: exact - floor };
  });

  let remainder = amountMinor - raw.reduce((sum, row) => sum + row.floor, 0);
  const sorted = [...raw].sort((a, b) => b.frac - a.frac);
  const bonusUsers = new Set(sorted.slice(0, remainder).map((row) => row.userId));

  return raw.map((row) => ({
    userId: row.userId,
    amountMinor: row.floor + (bonusUsers.has(row.userId) ? 1 : 0),
    shares: row.shares,
  }));
}
