import type { CampaignPlan } from "./campaign-plan";

/** Return `plan` as the JSON stored in `campaigns.plan`, leaving out an unset `startDate`. */
export function toCampaignPlanJson(plan: CampaignPlan) {
  return {
    availability: plan.availability.map((day) => ({
      fromHour: day.fromHour,
      toHour: day.toHour,
    })),
    maxPerDay: plan.maxPerDay,
    minGapMinutes: plan.minGapMinutes,
    ...(plan.startDate === undefined ? {} : { startDate: plan.startDate }),
  };
}
