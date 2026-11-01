"use server";

import keyBy from "lodash/keyBy.js";

import type { PlanPreviewRow } from "@/app/cc/(app)/_overview/plan-preview-row";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { loadPlannerInput } from "@/lib/cc/data/load-planner-input";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getPostName } from "@/lib/cc/get-post-name";
import { planCampaignSchedule } from "@/lib/cc/plan-campaign-schedule";
import { PLATFORMS } from "@/lib/cc/platforms";

function formatTime(date: Date | undefined) {
  return date === undefined
    ? undefined
    : formatSgt({ date, pattern: "EEE dd MMM HH:mm" });
}

/** Return the schedule the planner proposes for `campaignId` right now and the time it was planned at, without writing anything. */
export async function previewCampaignPlan(options: {
  campaignId: string;
  includeUserPlaced: boolean;
}) {
  await requireCcOwner();
  const input = await loadPlannerInput({ campaignId: options.campaignId });
  const plannedAt = new Date();
  const rows = planCampaignSchedule({
    posts: input.plannerPosts,
    plan: input.plan,
    heat: input.heat,
    now: plannedAt,
    includeUserPlaced: options.includeUserPlaced,
  });
  const postsById = keyBy(input.posts, (post) => post.id);
  return {
    plannedAt: plannedAt.toISOString(),
    rows: rows.map((row): PlanPreviewRow => {
      const post = postsById[row.postId];
      return {
        postId: row.postId,
        platformId: row.platformId,
        name:
          (post === undefined ? "" : getPostName(post)) ||
          PLATFORMS[row.platformId].label,
        wave: row.wave,
        kind: row.kind,
        currentLabel: formatTime(row.current),
        proposedLabel:
          row.kind === "moved" || row.kind === "unchanged"
            ? formatTime(row.proposed)
            : undefined,
        proposedAt:
          row.kind === "moved" || row.kind === "unchanged"
            ? row.proposed.toISOString()
            : undefined,
        reason: row.reason,
      };
    }),
  };
}
