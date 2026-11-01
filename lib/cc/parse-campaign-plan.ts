import type { Json } from "./supabase/__generated__/types";
import {
  CAMPAIGN_KINDS,
  type CampaignPlan,
  DEFAULT_CAMPAIGN_PLAN,
} from "./campaign-plan";
import { isPlatformId } from "./is-platform-id";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function readDay(value: Json | undefined) {
  return typeof value === "string" && DAY.test(value) ? value : undefined;
}

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
  const notBefore = plan.notBefore;
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
    startDate: readDay(plan.startDate),
    kind:
      CAMPAIGN_KINDS.find((kind) => kind === plan.kind) ??
      DEFAULT_CAMPAIGN_PLAN.kind,
    intent:
      typeof plan.intent === "string"
        ? plan.intent
        : DEFAULT_CAMPAIGN_PLAN.intent,
    eventDate: readDay(plan.eventDate),
    notBefore:
      typeof notBefore === "object" &&
      notBefore !== null &&
      !Array.isArray(notBefore)
        ? Object.fromEntries(
            Object.entries(notBefore).flatMap(([id, day]) => {
              const value = readDay(day);
              return isPlatformId(id) && value !== undefined
                ? [[id, value]]
                : [];
            })
          )
        : DEFAULT_CAMPAIGN_PLAN.notBefore,
  };
}
