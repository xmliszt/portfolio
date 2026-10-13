/** Return how far a pleat stands off the rod when `fabric` of cloth hangs between two rings `gap` apart: the height of the fold's triangle, 0 once the cloth is taut. */
export function getPleatDepth(options: { gap: number; fabric: number }) {
  const half = options.fabric / 2;
  const span = Math.min(options.gap, options.fabric) / 2;
  return Math.sqrt(half * half - span * span);
}
