import { getZoneOffsetHours } from "./get-zone-offset-hours";
import type { ResearchedWindow } from "./researched-windows";

const SGT_OFFSET_HOURS = 8;

/** Return the Singapore-time start and end hours of `window`, whose hours are on `timeZone`'s clock, using that zone's offset at `at`; hours past 24 run into the next day. */
export function getSgtWindow(options: {
  window: ResearchedWindow;
  timeZone: string;
  at: Date;
}) {
  const shift =
    SGT_OFFSET_HOURS -
    getZoneOffsetHours({ timeZone: options.timeZone, at: options.at });
  return {
    startHour: options.window.startHour + shift,
    endHour: options.window.endHour + shift,
  };
}
