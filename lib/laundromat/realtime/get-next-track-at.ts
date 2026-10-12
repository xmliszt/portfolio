/** Return the earliest time at or after `now` when one more presence update fits, given the times of earlier updates in `sentAts`, at most `limit` within any `windowMs`. */
export function getNextTrackAt(options: {
  sentAts: number[];
  now: number;
  limit: number;
  windowMs: number;
}) {
  const blocking = options.sentAts
    .filter((sentAt) => sentAt > options.now - options.windowMs)
    .toSorted((a, b) => a - b)
    .slice(-options.limit);
  if (blocking.length < options.limit) return options.now;
  return Math.max(options.now, Math.min(...blocking) + options.windowMs);
}
