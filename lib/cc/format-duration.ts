const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Return `durationMs` as its two largest units ("2 d 4 h", "3 h 5 min", "12 min"), never less than "1 min". */
export function formatDuration(durationMs: number) {
  const totalMinutes = Math.max(1, Math.floor(durationMs / MINUTE_MS));
  const days = Math.floor((totalMinutes * MINUTE_MS) / DAY_MS);
  const hours = Math.floor(((totalMinutes * MINUTE_MS) % DAY_MS) / HOUR_MS);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return hours > 0 ? `${days} d ${hours} h` : `${days} d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }
  return `${minutes} min`;
}
