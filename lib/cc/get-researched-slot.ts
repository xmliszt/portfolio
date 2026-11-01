import maxBy from "lodash/maxBy.js";

import { getZoneParts } from "./get-zone-parts";
import type { PlatformId } from "./platforms";
import { RESEARCHED_WINDOWS } from "./researched-windows";

/** Return the researched score from 0 to 1 of `platformId` at `at`, read on the platform's `timeZone` clock, the window behind it, and the weight of that day. */
export function getResearchedSlot(options: {
  platformId: PlatformId;
  at: Date;
}) {
  const research = RESEARCHED_WINDOWS[options.platformId];
  const parts = getZoneParts({ date: options.at, timeZone: research.timeZone });
  const dayWeight = research.dayWeights[parts.weekday];
  const window = maxBy(
    research.hours.filter(
      (hours) => parts.hour >= hours.startHour && parts.hour < hours.endHour
    ),
    (hours) => hours.strength
  );
  return {
    window,
    dayWeight,
    score: window === undefined ? 0 : dayWeight * window.strength,
  };
}
