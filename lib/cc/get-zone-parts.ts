import { getZoneOffsetHours } from "./get-zone-offset-hours";

const HOUR_MS = 60 * 60 * 1000;

/** Return the weekday (0 for Monday), hour and minute of `date` on `timeZone`'s clock. */
export function getZoneParts(options: { date: Date; timeZone: string }) {
  const shifted = new Date(
    options.date.getTime() +
      getZoneOffsetHours({ timeZone: options.timeZone, at: options.date }) *
        HOUR_MS
  );
  return {
    weekday: (shifted.getUTCDay() + 6) % 7,
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}
