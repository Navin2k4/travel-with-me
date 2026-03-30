/** `amount` is in major currency units (e.g. INR rupees), matching Prisma `Decimal` columns. */
export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** When displaying values still computed in integer minor units (e.g. split preview). */
export function formatCurrencyFromMinorUnits(amountMinor: number, currency = "INR") {
  return formatCurrency(amountMinor / 100, currency);
}
