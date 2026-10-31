/** Return `value` clamped to `min`..`max`, or `undefined` when it is not a finite number. */
export function clampNumber(options: {
  value: unknown;
  min: number;
  max: number;
}) {
  if (typeof options.value !== "number" || !Number.isFinite(options.value))
    return undefined;
  return Math.min(options.max, Math.max(options.min, options.value));
}
