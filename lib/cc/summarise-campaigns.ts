import groupBy from "lodash/groupBy.js";
import sortBy from "lodash/sortBy.js";

import type { CampaignRow, PostRow } from "./data/cc-rows";

export type CampaignSummary = {
  id: string;
  name: string;
  code: string;
  color: string;
  /** `post` and `repost` rows with `status` `scheduled` and `scheduled_at` after `now`. */
  upcomingCount: number;
  nextPost: { platform: string; at: string } | undefined;
  /** `true` if any of the campaign's rows has `status` `scheduled` and `scheduled_at` after `now`; `false` when none has. */
  isActive: boolean;
};

/** Return a summary of each of `campaigns` from its `posts` as of `now`, active campaigns first, each group newest `starts_at` first. */
export function summariseCampaigns(options: {
  campaigns: readonly CampaignRow[];
  posts: readonly PostRow[];
  now: Date;
}): CampaignSummary[] {
  const upcomingByCampaign = groupBy(
    sortBy(
      options.posts.filter(
        (post) =>
          post.status === "scheduled" &&
          post.scheduled_at !== null &&
          new Date(post.scheduled_at) > options.now
      ),
      (post) => post.scheduled_at
    ),
    (post) => post.campaign_id
  );
  const summaries = options.campaigns.map((campaign) => {
    const upcoming = upcomingByCampaign[campaign.id] ?? [];
    const campaignPosts = upcoming.filter(
      (post) => post.kind === "post" || post.kind === "repost"
    );
    const next = campaignPosts.at(0);
    return {
      summary: {
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        color: campaign.color,
        upcomingCount: campaignPosts.length,
        nextPost:
          next?.scheduled_at === null || next === undefined
            ? undefined
            : { platform: next.platform, at: next.scheduled_at },
        isActive: upcoming.length > 0,
      },
      startsAtMs:
        campaign.starts_at === null
          ? 0
          : new Date(campaign.starts_at).getTime(),
    };
  });
  return sortBy(
    summaries,
    (entry) => !entry.summary.isActive,
    (entry) => -entry.startsAtMs
  ).map((entry) => entry.summary);
}
