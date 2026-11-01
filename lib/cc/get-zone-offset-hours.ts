const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** Return how many hours `timeZone`'s clock is ahead of UTC at `at`, such as -4 for New York in July. */
export function getZoneOffsetHours(options: { timeZone: string; at: Date }) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: options.timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
      .formatToParts(options.at)
      .map((part) => [part.type, part.value])
  );
  const clockMs = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute)
  );
  const atMinuteMs = Math.floor(options.at.getTime() / MINUTE_MS) * MINUTE_MS;
  return (clockMs - atMinuteMs) / HOUR_MS;
}
