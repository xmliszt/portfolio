import "server-only";

import mapValues from "lodash/mapValues.js";

import { getDefaultWave } from "@/lib/cc/get-default-wave";
import { getHourHeat } from "@/lib/cc/get-hour-heat";
import { getPostWindow } from "@/lib/cc/get-post-window";
import { getSlotScores } from "@/lib/cc/get-slot-scores";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { parseCampaignPlan } from "@/lib/cc/parse-campaign-plan";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import type { PlannerPost } from "@/lib/cc/plan-campaign-schedule";
import { PLATFORMS } from "@/lib/cc/platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { listAllPosts } from "./list-all-posts";
import { listPostMetrics } from "./list-post-metrics";
import { toStatRows } from "./to-stat-rows";

/** Return what scheduling needs for `campaignId`: its parsed plan settings, its own-variant posts, those posts' top-level `kind = 'post'` rows as planner posts, the times and platforms of its unskipped reposts and of the unskipped `post` and `repost` rows of other campaigns and custom posts as `occupied` with their post ids, and slot scores per platform. */
export async function loadPlannerInput(options: { campaignId: string }) {
  const { data: campaign, error } = await createCcServiceClient()
    .from("campaigns")
    .select("*")
    .eq("id", options.campaignId)
    .single();
  if (error) throw error;
  const allPosts = await listAllPosts({ variant: "mine" });
  const posts = allPosts.filter(
    (post) => post.campaign_id === options.campaignId
  );
  const metrics = await listPostMetrics({
    postIds: posts.map((post) => post.id),
  });
  const stats = toStatRows({ posts, metrics });
  const plan = parseCampaignPlan(campaign.plan);
  const now = new Date();
  const plannerPosts = posts.flatMap((post): PlannerPost[] => {
    if (post.kind !== "post" || !isPlatformId(post.platform)) return [];
    const wave =
      post.wave ??
      (PLATFORMS[post.platform].plannerPinned
        ? undefined
        : getDefaultWave(parsePostAssets(post.assets)));
    return [
      {
        id: post.id,
        platformId: post.platform,
        status: post.status,
        scheduledAt:
          post.scheduled_at === null ? undefined : new Date(post.scheduled_at),
        scheduledBy: post.scheduled_by === "planner" ? "planner" : "user",
        wave,
        ...getPostWindow({ plan, platformId: post.platform, wave }),
      },
    ];
  });
  const occupied = [
    ...posts.filter((post) => post.kind === "repost"),
    ...allPosts.filter(
      (post) =>
        post.campaign_id !== options.campaignId &&
        (post.kind === "post" || post.kind === "repost")
    ),
  ].flatMap((post) =>
    post.status !== "skipped" &&
    post.scheduled_at !== null &&
    isPlatformId(post.platform)
      ? [
          {
            postId: post.id,
            at: new Date(post.scheduled_at),
            platformId: post.platform,
          },
        ]
      : []
  );
  return {
    plan,
    posts,
    plannerPosts,
    occupied,
    heat: mapValues(PLATFORMS, (platform) =>
      getSlotScores({
        heat: getHourHeat({ ...stats, platformId: platform.id, weekOf: now }),
      })
    ),
  };
}
