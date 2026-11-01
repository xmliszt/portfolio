import maxBy from "lodash/maxBy.js";

import type { PlatformId } from "./platforms";
import { RESEARCHED_WINDOWS } from "./researched-windows";

/** Return the researched score from 0 to 1 of `platformId` at `weekday` (0 for Monday) and `hour` in Singapore time, the window behind it, and the weight of the day that window starts on. */
export function getResearchedSlot(options: {
  platformId: PlatformId;
  weekday: number;
  hour: number;
}) {
  const research = RESEARCHED_WINDOWS[options.platformId];
  const matches = research.hours.flatMap((window) =>
    [0, 1].flatMap((daysBack) => {
      const windowHour = options.hour + 24 * daysBack;
      if (windowHour < window.startHour || windowHour >= window.endHour) {
        return [];
      }
      const dayWeight =
        research.dayWeights[(options.weekday + 7 - daysBack) % 7];
      return [{ window, dayWeight, score: dayWeight * window.strength }];
    })
  );
  const best = maxBy(matches, (match) => match.score);
  return (
    best ?? {
      window: undefined,
      dayWeight: research.dayWeights[options.weekday],
      score: 0,
    }
  );
}
