import countBy from "lodash/countBy.js";
import minBy from "lodash/minBy.js";

import { CAMPAIGN_COLORS } from "./campaign-colors";

/** Return the campaign colour that `usedColors` holds the fewest times, the earliest in `CAMPAIGN_COLORS` on a tie. */
export function pickCampaignColor(usedColors: readonly string[]) {
  const counts = countBy(usedColors);
  return (
    minBy(CAMPAIGN_COLORS, (color) => counts[color] ?? 0) ?? CAMPAIGN_COLORS[0]
  );
}
