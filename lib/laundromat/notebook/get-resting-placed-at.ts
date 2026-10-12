/** Return the time of this visitor's last saved note from its `stored` value while it is at most `intervalMs` before `now` and not after it, or `undefined` otherwise. */
export function getRestingPlacedAt(options: {
  stored: string | null;
  now: number;
  intervalMs: number;
}) {
  if (options.stored === null) return undefined;
  const placedAt = Number(options.stored);
  if (!Number.isFinite(placedAt)) return undefined;
  const isResting =
    placedAt <= options.now && placedAt + options.intervalMs > options.now;
  return isResting ? placedAt : undefined;
}
