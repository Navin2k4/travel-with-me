/**
 * Map "Visit schedule" fields → single `visitedAt` instant (local → UTC ISO).
 * Prefers `fromTime`, then `toTime`, then start of day when only date is set.
 */
export function visitScheduleToVisitedAtIso(
  visitedDate: string,
  fromTime: string,
  toTime: string,
): string | undefined {
  const date = visitedDate.trim();
  if (!date) return undefined;
  const from = fromTime.trim();
  const to = toTime.trim();
  if (from) return localVisitDateAndTimeToIso(date, from);
  if (to) return localVisitDateAndTimeToIso(date, to);
  return localVisitDateAndTimeToIso(date, "00:00");
}

/** Local date (YYYY-MM-DD) + time (HH:mm from <input type="time">) → UTC ISO for the server. */
export function localVisitDateAndTimeToIso(dateStr: string, timeStr: string): string | undefined {
  const date = dateStr.trim();
  const time = timeStr.trim();
  if (!date || !time) return undefined;
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const local = new Date(`${date}T${normalizedTime}`);
  if (Number.isNaN(local.getTime())) return undefined;
  return local.toISOString();
}

/** <input type="datetime-local" /> value is local wall time — convert to UTC ISO for the server. */
export function dateTimeLocalValueToIso(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const withSeconds = v.length === 16 ? `${v}:00` : v;
  const local = new Date(withSeconds);
  if (Number.isNaN(local.getTime())) return undefined;
  return local.toISOString();
}

/** Format a Date for <input type="datetime-local" /> using the user's local timezone (not UTC). */
export function formatDateTimeLocalInput(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatPlaceVisitedClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
