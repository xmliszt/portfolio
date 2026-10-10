import { formatClockTime } from "@/lib/laundromat/laundry/format-clock-time";

import { formatEntryDay } from "./format-entry-day";

/** Return the local day and time of `timestampMs` as `oct 8 · 2:14 a.m.`. */
export function formatEntryDate(timestampMs: number) {
  return `${formatEntryDay(timestampMs)} · ${formatClockTime(timestampMs)}`;
}
