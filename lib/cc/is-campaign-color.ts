import { CAMPAIGN_COLORS, type CampaignColor } from "./campaign-colors";

/** `true` if `value` is one of `CAMPAIGN_COLORS`; `false` otherwise. */
export function isCampaignColor(value: string): value is CampaignColor {
  return CAMPAIGN_COLORS.some((color) => color === value);
}
