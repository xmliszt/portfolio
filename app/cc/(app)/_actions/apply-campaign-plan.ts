"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { loadPlannerInput } from "@/lib/cc/data/load-planner-input";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import { planCampaignSchedule } from "@/lib/cc/plan-campaign-schedule";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

const MAX_PLAN_AGE_MS = 60 * 60 * 1000;

/** Plan `campaignId` again as of `plannedAt` (or now when that is in the future or over an hour old), move each post the plan moves to a time still ahead with its unposted replies and comments, mark it `scheduled_by = 'planner'`, resync reminders, and return how many posts moved. */
export async function applyCampaignPlan(options: {
  campaignId: string;
  includeUserPlaced: boolean;
  plannedAt: string;
}) {
  await requireCcOwner();
  const now = new Date();
  const plannedAt = new Date(options.plannedAt);
  const ageMs = now.getTime() - plannedAt.getTime();
  const input = await loadPlannerInput({ campaignId: options.campaignId });
  const moves = planCampaignSchedule({
    posts: input.plannerPosts,
    plan: input.plan,
    heat: input.heat,
    now: ageMs >= 0 && ageMs < MAX_PLAN_AGE_MS ? plannedAt : now,
    includeUserPlaced: options.includeUserPlaced,
    occupied: input.occupied,
  }).flatMap((row) =>
    row.kind === "moved" && row.proposed.getTime() > now.getTime()
      ? [{ postId: row.postId, at: row.proposed }]
      : []
  );

  const supabase = createCcServiceClient();
  for (const move of moves) {
    const { data: moved, error } = await supabase.rpc("reschedule_post", {
      p_post_id: move.postId,
      p_scheduled_at: move.at.toISOString(),
      p_scheduled_by: "planner",
    });
    if (error) throw error;
    await Promise.all(
      moved.map((row) =>
        syncPostReminders({
          postId: row.id,
          status: row.status,
          kind: row.kind,
          repostAs: row.repost_as,
          parentPostId: row.parent_post_id,
          campaignId: row.campaign_id,
          scheduledAt: row.scheduled_at,
          postedAt: row.posted_at,
        })
      )
    );
  }
  revalidatePath("/cc", "layout");
  return { movedCount: moves.length };
}
