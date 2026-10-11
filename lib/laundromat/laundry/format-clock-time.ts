import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

/** Return the local time of `timestampMs` in `locale`: `1:24 a.m.` in English, the locale's own clock format otherwise. */
export function formatClockTime(options: {
  timestampMs: number;
  locale: LaundromatLocale;
}) {
  if (options.locale !== "en") {
    return new Intl.DateTimeFormat(options.locale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(options.timestampMs);
  }
  const date = new Date(options.timestampMs);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? "a.m." : "p.m."}`;
}
