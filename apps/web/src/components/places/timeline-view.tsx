"use client";

import { formatPlaceVisitedClock } from "@/lib/visit-datetime";

type TimelinePlace = {
  id: string;
  name: string;
  visitedAt: string;
  dayNumber: number | null;
};

export function TimelineView({ places }: { places: TimelinePlace[] }) {
  const grouped = new Map<string, TimelinePlace[]>();
  for (const place of places) {
    const key = place.dayNumber ? `Day ${place.dayNumber}` : "No Day";
    grouped.set(key, [...(grouped.get(key) ?? []), place]);
  }

  return (
    <div className="grid gap-4">
      {[...grouped.entries()].map(([dayLabel, items]) => (
        <div key={dayLabel} className="rounded border p-3">
          <h4 className="mb-2 text-sm font-semibold">{dayLabel}</h4>
          <ul className="grid gap-2">
            {items
              .sort((a, b) => +new Date(a.visitedAt) - +new Date(b.visitedAt))
              .map((item) => (
                <li key={item.id} className="text-sm">
                  {formatPlaceVisitedClock(item.visitedAt)} {"->"}{" "}
                  {item.name}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
