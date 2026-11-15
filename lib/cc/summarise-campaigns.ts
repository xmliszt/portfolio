import groupBy from "lodash/groupBy.js";
import sortBy from "lodash/sortBy.js";

import type { CampaignRow, PostRow } from "./data/cc-rows";

export type CampaignSummary = {
  id: string;
  name: string;
  code: string;
  color: string;
  /** Rows with `status` `scheduled` and `scheduled_at` after `now`. */
  upcomingCount: number;
  nextPost: { platform: string; at: string } | undefined;
  /** `true` if the campaign's `ended_at` is null and any of its rows has `status` `scheduled` and `scheduled_at` after `now`; `false` otherwise. */
  isActive: boolean;
  /** `true` if the campaign's `ended_at` is set; `false` when it is null. */
  isEnded: boolean;
};

/** Return a summary of each of `campaigns` from its `posts` as of `now`: active campaigns first, then the others that have not ended, then the ended ones, each group newest `starts_at` first. */
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
    const isEnded = campaign.ended_at !== null;
    const next = upcoming.at(0);
    return {
      summary: {
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        color: campaign.color,
        upcomingCount: upcoming.length,
        nextPost:
          next?.scheduled_at === null || next === undefined
            ? undefined
            : { platform: next.platform, at: next.scheduled_at },
        isActive: !isEnded && upcoming.length > 0,
        isEnded,
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
    (entry) => entry.summary.isEnded,
    (entry) => -entry.startsAtMs
  ).map((entry) => entry.summary);
}
