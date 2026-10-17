export type TouchStreak = { count: number; atMs: number };

/** Return the streak after a touch at `nowMs`: one longer when the previous touch was at most `windowMs` earlier, otherwise a new streak of 1. */
export function advanceTouchStreak(options: {
  previous: TouchStreak | undefined;
  nowMs: number;
  windowMs: number;
}): TouchStreak {
  const { previous, nowMs } = options;
  if (previous !== undefined && nowMs - previous.atMs <= options.windowMs) {
    return { count: previous.count + 1, atMs: nowMs };
  }
  return { count: 1, atMs: nowMs };
}
