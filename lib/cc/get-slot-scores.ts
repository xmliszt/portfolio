import range from "lodash/range.js";

import type { getHourHeat } from "./get-hour-heat";
import { getResearchedSlot } from "./get-researched-slot";
import type { PlatformId } from "./platforms";

export type SlotScores = {
  source: "own" | "researched";
  /** Weekday (0 for Monday) × hour scores in Singapore time, from 0 to 1. */
  cells: number[][];
};

const UNMEASURED_WEIGHT = 0.5;

/** Return `heat` as scores from 0 to 1: researched cells as they are, own views divided by the busiest hour's, and own hours without posts at half their researched score. */
export function getSlotScores(options: {
  heat: ReturnType<typeof getHourHeat>;
  platformId: PlatformId;
}): SlotScores {
  const heat = options.heat;
  if (heat.kind === "researched") {
    return { source: "researched", cells: heat.cells };
  }
  const maxViews = Math.max(1, ...heat.cells.flat().map((views) => views ?? 0));
  return {
    source: "own",
    cells: range(7).map((weekday) =>
      range(24).map((hour) => {
        const views = heat.cells.at(weekday)?.at(hour);
        return views === undefined
          ? UNMEASURED_WEIGHT *
              getResearchedSlot({
                platformId: options.platformId,
                weekday,
                hour,
              }).score
          : views / maxViews;
      })
    ),
  };
}
