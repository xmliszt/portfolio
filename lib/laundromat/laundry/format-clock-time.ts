/** Return the local time of `timestampMs` as `1:24 a.m.`. */
export function formatClockTime(timestampMs: number) {
  const date = new Date(timestampMs);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? "a.m." : "p.m."}`;
}
