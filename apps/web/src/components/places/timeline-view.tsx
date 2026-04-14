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

  const dayGroups = [...grouped.entries()].sort(([a], [b]) => {
    if (a === "No Day") return 1;
    if (b === "No Day") return -1;
    const aDay = Number(a.replace("Day ", ""));
    const bDay = Number(b.replace("Day ", ""));
    return aDay - bDay;
  });

  return (
    <div className="grid gap-4">
      {dayGroups.map(([dayLabel, items]) => (
        <section key={dayLabel} className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
            <h4 className="text-sm font-semibold text-foreground">{dayLabel}</h4>
            <span className="text-xs text-muted-foreground">{items.length} stop(s)</span>
          </header>
          <ul className="grid gap-0 p-3">
            {items
              .sort((a, b) => +new Date(a.visitedAt) - +new Date(b.visitedAt))
              .map((item, index, arr) => {
                const dateLabel = new Date(item.visitedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                const isLast = index === arr.length - 1;

                return (
                  <li key={item.id} className="grid grid-cols-[auto_1fr] gap-3 py-2">
                    <div className="relative flex w-5 justify-center">
                      {!isLast ? <span className="absolute top-4 bottom-[-12px] w-px bg-border" /> : null}
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="rounded-lg border border-border bg-background px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {formatPlaceVisitedClock(item.visitedAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{dateLabel}</p>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
