import { Prisma } from "@travel-with-me/db";

/** Major currency units (e.g. rupees) → integer minor units (e.g. paise) for split math. */
export function majorToMinorUnits(major: number): number {
  return Math.round(major * 100);
}

/** Minor units → Prisma Decimal stored as major units (2 dp). */
export function minorUnitsToDecimal(minor: number): Prisma.Decimal {
  return new Prisma.Decimal(minor).div(100);
}

/** Form EXACT amounts are entered in major units; split engine expects minor units. */
export function exactSplitDetailsMajorToMinor(splitDetails: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(splitDetails).map(([userId, value]) => [userId, Math.round(value * 100)]),
  );
}

export function prepareComputeSplitInput(args: {
  amountMajor: number;
  splitType: "EQUAL" | "EXACT_AMOUNT" | "PERCENTAGE" | "SHARES";
  participantIds: string[];
  splitDetails?: Record<string, number>;
}): {
  amountMinor: number;
  splitType: typeof args.splitType;
  participantIds: string[];
  splitDetails?: Record<string, number>;
} {
  const amountMinor = majorToMinorUnits(args.amountMajor);
  const splitDetails =
    args.splitType === "EXACT_AMOUNT" && args.splitDetails
      ? exactSplitDetailsMajorToMinor(args.splitDetails)
      : args.splitDetails;
  return {
    amountMinor,
    splitType: args.splitType,
    participantIds: args.participantIds,
    splitDetails,
  };
}

export function decimalAmountToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (
    typeof value === "object" &&
    "toNumber" in (value as object) &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}
