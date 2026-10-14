function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Return how far the good night drop has fallen at `elapsedMs` into a track of `trackMs` (`drop`, 0 at the top to 1 landed at `landShare` of the track, slowing into place) and how far the "good night" text has faded in (`text`, 0 until the drop lands, then 1 after `textMs`). */
export function getGoodNightProgress(options: {
  elapsedMs: number;
  trackMs: number;
  landShare: number;
  textMs: number;
}) {
  const landMs = options.trackMs * options.landShare;
  const fallen = clamp01(options.elapsedMs / landMs);
  return {
    drop: 1 - (1 - fallen) ** 2,
    text: clamp01((options.elapsedMs - landMs) / options.textMs),
  };
}
