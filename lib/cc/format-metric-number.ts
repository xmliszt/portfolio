const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/** Return `value` with thousands separators, or "—" when it is `undefined`. */
export function formatMetricNumber(value: number | undefined) {
  return value === undefined ? "—" : formatter.format(value);
}
