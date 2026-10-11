import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { formatClockTime } from "@/lib/laundromat/laundry/format-clock-time";

import { formatEntryDay } from "./format-entry-day";

/** Return the local day and time of `timestampMs` in `locale`, as `oct 8 · 2:14 a.m.` in English. */
export function formatEntryDate(options: {
  timestampMs: number;
  locale: LaundromatLocale;
}) {
  return `${formatEntryDay(options)} · ${formatClockTime(options)}`;
}
