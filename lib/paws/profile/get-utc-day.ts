/** Return the UTC calendar day of `date` as `YYYY-MM-DD`. */
export function getUtcDay(date: Date) {
  return date.toISOString().slice(0, 10);
}
