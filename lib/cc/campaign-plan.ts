/** Hours in Singapore time when the owner can post on one weekday; the day is off when `fromHour` is not before `toHour`. */
export type DayAvailability = { fromHour: number; toHour: number };

/** The planner settings stored in `campaigns.plan`, with `availability` running Monday to Sunday. */
export type CampaignPlan = {
  availability: readonly DayAvailability[];
  maxPerDay: number;
  minGapMinutes: number;
  /** First Singapore-time day ("yyyy-MM-dd") the planner may use, or `undefined` for today. */
  startDate: string | undefined;
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
};
