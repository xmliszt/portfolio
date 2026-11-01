import groupBy from "lodash/groupBy.js";
import maxBy from "lodash/maxBy.js";
import sum from "lodash/sum.js";

import { getLatestMetric } from "./get-latest-metric";
import { getPlatformMedian } from "./get-platform-median";
import { getViewsAt24h } from "./get-views-at-24h";
import type { StatMetric, StatPost } from "./stats-types";

function sumDefined(values: (number | undefined)[]) {
  const defined = values.filter((value) => value !== undefined);
  return defined.length === 0 ? undefined : sum(defined);
}

/** Return the campaign's logged totals: 24h views overall and per platform, the best post's ratio to its platform median, engagement rate and clicks from each post's latest numbers, and the latest Product Hunt upvotes and rank; each is `undefined` when nothing was logged for it. */
export function getCampaignTotals(options: {
  posts: readonly StatPost[];
  metrics: readonly StatMetric[];
}) {
  const measured = options.posts.flatMap((post) => {
    const views = getViewsAt24h({ metrics: options.metrics, postId: post.id });
    return views === undefined ? [] : [{ post, views }];
  });
  const byPlatform = groupBy(measured, (entry) => entry.post.platform);
  const viewsByPlatform = Object.values(byPlatform)
    .map((entries) => ({
      platform: entries[0].post.platform,
      views: sum(entries.map((entry) => entry.views)),
    }))
    .toSorted((a, b) => b.views - a.views);

  const best = maxBy(
    measured.flatMap((entry) => {
      const median = getPlatformMedian({
        posts: options.posts,
        metrics: options.metrics,
        platformId: entry.post.platform,
      });
      return byPlatform[entry.post.platform].length >= 2 && median
        ? [{ platform: entry.post.platform, ratio: entry.views / median }]
        : [];
    }),
    (entry) => entry.ratio
  );

  const latest = options.posts.flatMap((post) => {
    const metric = getLatestMetric({
      metrics: options.metrics,
      postId: post.id,
    });
    return metric === undefined ? [] : [{ post, metric }];
  });
  const engaged = latest.filter(
    (entry) => entry.metric.views !== undefined && entry.metric.views > 0
  );
  const engagementViews = sum(engaged.map((entry) => entry.metric.views ?? 0));
  const interactions = sum(
    engaged.map(
      (entry) =>
        (entry.metric.likes ?? 0) +
        (entry.metric.comments ?? 0) +
        (entry.metric.shares ?? 0)
    )
  );
  const productHunt = maxBy(
    latest.filter(
      (entry) =>
        entry.post.platform === "producthunt" &&
        (entry.metric.upvotes !== undefined || entry.metric.rank !== undefined)
    ),
    (entry) => entry.metric.capturedAt.getTime()
  )?.metric;

  return {
    views24h: sumDefined(measured.map((entry) => entry.views)),
    viewsByPlatform,
    bestRatio: best,
    engagementRate:
      engagementViews > 0 ? interactions / engagementViews : undefined,
    clicks: sumDefined(latest.map((entry) => entry.metric.clicks)),
    productHuntUpvotes: productHunt?.upvotes,
    productHuntRank: productHunt?.rank,
  };
}
