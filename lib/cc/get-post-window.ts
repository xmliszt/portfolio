import { addDays } from "./add-days";
import type { CampaignPlan } from "./campaign-plan";
import type { PlatformId } from "./platforms";
import { sgtToUtc } from "./sgt-to-utc";

function toStart(day: string | undefined) {
  return day === undefined ? undefined : sgtToUtc({ date: day, time: "00:00" });
}

/** Return the earliest and latest time a post may go out: from the latest of `plan.notBefore[platformId]` and, in an event campaign, its day (the day before `plan.eventDate` for wave 1, the event day for later waves), until the end of that event day; each `undefined` when nothing sets it. */
export function getPostWindow(options: {
  plan: CampaignPlan;
  platformId: PlatformId;
  wave: number | undefined;
}) {
  const eventDate = options.plan.eventDate;
  const eventDay =
    options.plan.kind !== "event" || eventDate === undefined
      ? undefined
      : options.wave === 1
        ? addDays({ day: eventDate, days: -1 })
        : eventDate;
  const firstDay = [options.plan.notBefore[options.platformId], eventDay]
    .filter((value) => value !== undefined)
    .toSorted()
    .at(-1);
  return {
    notBefore: toStart(firstDay),
    notAfter: toStart(
      eventDay === undefined ? undefined : addDays({ day: eventDay, days: 1 })
    ),
  };
}
