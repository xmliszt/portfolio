import { isCampaignColor } from "./is-campaign-color";

/** Return the CSS custom property that holds `color`'s HSL channels, or slate's when `color` is not a campaign colour. */
export function getCampaignColorVar(color: string) {
  return `--cc-campaign-${isCampaignColor(color) ? color : "slate"}`;
}
