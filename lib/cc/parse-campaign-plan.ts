import type { Json } from "./supabase/__generated__/types";
import { type CampaignPlan, DEFAULT_CAMPAIGN_PLAN } from "./campaign-plan";

function readNumber(options: {
  value: Json | undefined;
  min: number;
  max: number;
  fallback: number;
}) {
  return typeof options.value === "number" &&
    Number.isInteger(options.value) &&
    options.value >= options.min &&
    options.value <= options.max
    ? options.value
    : options.fallback;
}

/** Return the planner settings in a `campaigns.plan` JSON value, using `DEFAULT_CAMPAIGN_PLAN` for any field that is missing or out of range. */
export function parseCampaignPlan(plan: Json): CampaignPlan {
  if (typeof plan !== "object" || plan === null || Array.isArray(plan)) {
    return DEFAULT_CAMPAIGN_PLAN;
  }
  const availability = plan.availability;
  const startDate = plan.startDate;
  return {
    availability: DEFAULT_CAMPAIGN_PLAN.availability.map(
      (fallback, weekday) => {
        const day = Array.isArray(availability)
          ? availability.at(weekday)
          : undefined;
        if (typeof day !== "object" || day === null || Array.isArray(day)) {
          return fallback;
        }
        return {
          fromHour: readNumber({
            value: day.fromHour,
            min: 0,
            max: 24,
            fallback: fallback.fromHour,
          }),
          toHour: readNumber({
            value: day.toHour,
            min: 0,
            max: 24,
            fallback: fallback.toHour,
          }),
        };
      }
    ),
    maxPerDay: readNumber({
      value: plan.maxPerDay,
      min: 1,
      max: 10,
      fallback: DEFAULT_CAMPAIGN_PLAN.maxPerDay,
    }),
    minGapMinutes: readNumber({
      value: plan.minGapMinutes,
      min: 0,
      max: 24 * 60,
      fallback: DEFAULT_CAMPAIGN_PLAN.minGapMinutes,
    }),
    startDate:
      typeof startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
        ? startDate
        : undefined,
  };
}
