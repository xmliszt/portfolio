import type { CampaignPlan } from "@/lib/cc/campaign-plan";
import type { PostRow } from "@/lib/cc/data/cc-rows";

import type { ScheduleContext } from "./schedule-clash-warning";

/** Return the scheduled `posts` and the `plan` limits that the clash warning checks a new time against. */
export function buildScheduleContext(options: {
  posts: readonly PostRow[];
  plan: CampaignPlan;
}): ScheduleContext {
  return {
    posts: options.posts.flatMap((post) =>
      post.scheduled_at === null
        ? []
        : [
            {
              id: post.id,
              at: post.scheduled_at,
              kind: post.kind,
              status: post.status,
            },
          ]
    ),
    minGapMinutes: options.plan.minGapMinutes,
    maxPerDay: options.plan.maxPerDay,
  };
}
