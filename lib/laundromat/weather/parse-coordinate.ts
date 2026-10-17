/** Return `value` as a number when it is a finite coordinate no further than `limit` from zero, or `undefined` for an empty, unparsable or out-of-range value. */
export function parseCoordinate(options: {
  value: string | null;
  limit: number;
}) {
  if (options.value === null || options.value.trim() === "") return undefined;
  const coordinate = Number(options.value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= options.limit
    ? coordinate
    : undefined;
}
