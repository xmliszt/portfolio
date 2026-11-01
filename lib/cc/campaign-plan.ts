import type { PlatformId } from "./platforms";

export const CAMPAIGN_KINDS = [
  "launch",
  "follow-up",
  "feature-update",
  "event",
] as const;

export type CampaignKind = (typeof CAMPAIGN_KINDS)[number];

export const CAMPAIGN_KIND_LABEL = {
  launch: "Launch",
  "follow-up": "Follow-up",
  "feature-update": "Feature update",
  event: "Event",
} as const satisfies { [kind in CampaignKind]: string };

/** Hours in Singapore time when the owner can post on one weekday; the day is off when `fromHour` is not before `toHour`. */
export type DayAvailability = { fromHour: number; toHour: number };

/** The planner settings stored in `campaigns.plan`, with `availability` running Monday to Sunday. */
export type CampaignPlan = {
  availability: readonly DayAvailability[];
  maxPerDay: number;
  minGapMinutes: number;
  /** First Singapore-time day ("yyyy-MM-dd") the planner may use, or `undefined` for today. */
  startDate: string | undefined;
  kind: CampaignKind;
  /** What the owner said this campaign should focus on, in their own words. */
  intent: string;
  /** Singapore-time day ("yyyy-MM-dd") of the event an event campaign is about, or `undefined` for other kinds. */
  eventDate: string | undefined;
  /** First Singapore-time day ("yyyy-MM-dd") each platform may post on, for platforms still inside their repost gap. */
  notBefore: { [id in PlatformId]?: string };
};

const WEEKDAY_EVENING = { fromHour: 20, toHour: 24 };
const WEEKEND_DAY = { fromHour: 10, toHour: 24 };

export const DEFAULT_CAMPAIGN_PLAN: CampaignPlan = {
  availability: [
    WEEKDAY_EVENING,
    WEEKDAY_EVENING,
    WEEKDAY_EVENING,
    WEEKDAY_EVENING,
    WEEKDAY_EVENING,
    WEEKEND_DAY,
    WEEKEND_DAY,
  ],
  maxPerDay: 2,
  minGapMinutes: 45,
  startDate: undefined,
  kind: "launch",
  intent: "",
  eventDate: undefined,
  notBefore: {},
};
