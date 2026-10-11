import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** Return the local day of `timestampMs` in `locale`: `oct 8` in English, the locale's short month and day otherwise. */
export function formatEntryDay(options: {
  timestampMs: number;
  locale: LaundromatLocale;
}) {
  if (options.locale !== "en") {
    return new Intl.DateTimeFormat(options.locale, {
      month: "short",
      day: "numeric",
    }).format(options.timestampMs);
  }
  const date = new Date(options.timestampMs);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
