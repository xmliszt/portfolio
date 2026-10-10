/** Return the hour of day named by a `?hour=` value (`"18.5"` is 18:30), or `undefined` unless it is a number in `[0, 24)`. */
export function parseHourOverride(value: string | null | undefined) {
  if (value === null || value === undefined || value.trim() === "") {
    return undefined;
  }
  const hour = Number(value);
  return Number.isFinite(hour) && hour >= 0 && hour < 24 ? hour : undefined;
}
