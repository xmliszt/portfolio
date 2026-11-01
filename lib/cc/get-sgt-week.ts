import { formatSgt } from "./format-sgt";
import { getSgtParts } from "./get-sgt-parts";
import { sgtToUtc } from "./sgt-to-utc";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Return the Monday-to-Sunday Singapore-time week holding `date` ("yyyy-MM-dd"): its seven day strings and the Mondays before and after it. */
export function getSgtWeek(options: { date: string }) {
  const midnight = sgtToUtc({ date: options.date, time: "00:00" });
  const monday = new Date(
    midnight.getTime() - getSgtParts(midnight).weekday * DAY_MS
  );
  const toDate = (offsetDays: number) =>
    formatSgt({
      date: new Date(monday.getTime() + offsetDays * DAY_MS),
      pattern: "yyyy-MM-dd",
    });
  return {
    days: [0, 1, 2, 3, 4, 5, 6].map(toDate),
    previous: toDate(-7),
    next: toDate(7),
  };
}
