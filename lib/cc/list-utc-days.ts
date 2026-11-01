/** Return the `count` UTC dates (`yyyy-MM-dd`, oldest first) that end on the day before `now`. */
export function listUtcDays(options: { now: Date; count: number }) {
  const todayStart = Date.UTC(
    options.now.getUTCFullYear(),
    options.now.getUTCMonth(),
    options.now.getUTCDate()
  );
  return Array.from({ length: options.count }, (_, index) =>
    new Date(todayStart - (options.count - index) * 86_400_000)
      .toISOString()
      .slice(0, 10)
  );
}
