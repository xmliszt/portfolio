import "server-only";

import mapValues from "lodash/mapValues.js";

import { getLinkHost } from "@/lib/cc/get-link-host";
import { getPlatformMedian } from "@/lib/cc/get-platform-median";
import { getViewsAt24h } from "@/lib/cc/get-views-at-24h";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import { PLATFORMS } from "@/lib/cc/platforms";
import type { CampaignHistoryPost } from "@/lib/cc/summarise-campaign-history";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { listPostMetrics } from "./list-post-metrics";
import { toStatRows } from "./to-stat-rows";

/** Return the owner's posted and scheduled top-level posts in every campaign with a link, each with its campaign's link host, first line, 24 h views and its platform's median 24 h views. */
export async function listCampaignHistory() {
  const supabase = createCcServiceClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, link");
  if (error) throw error;
  const hosts = Object.fromEntries(
    campaigns.flatMap((campaign) => {
      const host = getLinkHost(campaign.link);
      return host === undefined ? [] : [[campaign.id, host]];
    })
  );
  const campaignIds = Object.keys(hosts);
  if (campaignIds.length === 0) return [];
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .in("campaign_id", campaignIds)
    .eq("kind", "post")
    .eq("variant", "mine")
    .in("status", ["posted", "scheduled"]);
  if (postsError) throw postsError;
  const metrics = await listPostMetrics({
    postIds: posts.map((post) => post.id),
  });
  const stats = toStatRows({ posts, metrics });
  const medians = mapValues(PLATFORMS, (platform) =>
    getPlatformMedian({ ...stats, platformId: platform.id })
  );
  return posts.flatMap((post): CampaignHistoryPost[] => {
    const host = hosts[post.campaign_id];
    const at = post.posted_at ?? post.scheduled_at;
    if (!isPlatformId(post.platform) || host === undefined || at === null) {
      return [];
    }
    return [
      {
        host,
        platformId: post.platform,
        at: new Date(at),
        isPosted: post.status === "posted",
        firstLine:
          post.title ||
          post.body.split("\n").find((line) => line.trim() !== "") ||
          "",
        views24h: getViewsAt24h({ metrics: stats.metrics, postId: post.id }),
        medianViews24h: medians[post.platform],
        assetFiles: parsePostAssets(post.assets).map((asset) => asset.file),
        target: post.target ?? undefined,
      },
    ];
  });
}
