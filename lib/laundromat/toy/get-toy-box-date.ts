export function getToyBoxDate(options: { now: Date; hourOverride?: number }) {
  if (options.hourOverride === undefined) return options.now;
  const date = new Date(options.now);
  const seconds = Math.round(options.hourOverride * 3600);
  date.setHours(0, 0, seconds, 0);
  return date;
}
