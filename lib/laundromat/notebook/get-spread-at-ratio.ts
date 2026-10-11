/** Return the spread under a pointer at `ratio` (0–1) across a track of `spreadCount` equal slots, clamped to the track. */
export function getSpreadAtRatio(options: {
  ratio: number;
  spreadCount: number;
}) {
  const slot = Math.floor(options.ratio * options.spreadCount);
  return Math.min(options.spreadCount - 1, Math.max(0, slot));
}
