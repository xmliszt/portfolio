import { PRINT_LIFE_SECONDS } from "./print-life-seconds";
import type { ScenePrint } from "./render-types";

const MAX_PRINTS = 160;

/** Return the prints in `prints` that have not faded away by `time` seconds, keeping only the newest few when there are too many. */
export function pruneScenePrints(options: {
  prints: ScenePrint[];
  time: number;
}) {
  return options.prints
    .filter(
      (print) => options.time - print.bornAt < PRINT_LIFE_SECONDS[print.kind]
    )
    .slice(-MAX_PRINTS);
}
