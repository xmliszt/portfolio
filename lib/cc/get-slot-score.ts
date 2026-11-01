import { getResearchedSlot } from "./get-researched-slot";
import { getSgtParts } from "./get-sgt-parts";
import type { SlotScores } from "./get-slot-scores";
import type { PlatformId } from "./platforms";

const UNMEASURED_WEIGHT = 0.5;

/** Return the score from 0 to 1 of posting on `platformId` at `at`: the own-views cell for its Singapore weekday and hour, half the researched score at `at` for an own hour without posts, or the researched score at `at`. */
export function getSlotScore(options: {
  scores: SlotScores;
  platformId: PlatformId;
  at: Date;
}) {
  const researched = () =>
    getResearchedSlot({ platformId: options.platformId, at: options.at }).score;
  if (options.scores.source === "researched") return researched();
  const parts = getSgtParts(options.at);
  return (
    options.scores.cells.at(parts.weekday)?.at(parts.hour) ??
    UNMEASURED_WEIGHT * researched()
  );
}
