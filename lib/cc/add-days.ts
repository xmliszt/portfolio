const DAY_MS = 24 * 60 * 60 * 1000;

/** Return the calendar day ("yyyy-MM-dd") `days` after `day`, or before it when `days` is negative. */
export function addDays(options: { day: string; days: number }) {
  return new Date(
    Date.parse(`${options.day}T00:00:00Z`) + options.days * DAY_MS
  )
    .toISOString()
    .slice(0, 10);
}
