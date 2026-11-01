const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Return the Singapore-time calendar fields of `date`, with `weekday` 0 for Monday. */
export function getSgtParts(date: Date) {
  const shifted = new Date(date.getTime() + SGT_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: (shifted.getUTCDay() + 6) % 7,
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}
