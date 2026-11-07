export const CAMPAIGN_COLORS = [
  "violet",
  "gold",
  "teal",
  "coral",
  "orchid",
  "lime",
  "slate",
] as const;

export type CampaignColor = (typeof CAMPAIGN_COLORS)[number];
