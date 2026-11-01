import { getPlatformMedian } from "./get-platform-median";
import { getViewsAt24h } from "./get-views-at-24h";
import type { StatMetric, StatPost } from "./stats-types";

const REPOST_RATIO = 1.5;

/** Return the posts whose 24h views are at least 1.5× their platform's median, highest ratio first. */
export function getRepostSuggestions(options: {
  posts: readonly StatPost[];
  metrics: readonly StatMetric[];
}) {
  return options.posts
    .flatMap((post) => {
      const views = getViewsAt24h({
        metrics: options.metrics,
        postId: post.id,
      });
      const median = getPlatformMedian({
        posts: options.posts,
        metrics: options.metrics,
        platformId: post.platform,
      });
      if (views === undefined || !median) {
        return [];
      }
      const ratio = views / median;
      return ratio >= REPOST_RATIO ? [{ post, views, median, ratio }] : [];
    })
    .toSorted((a, b) => b.ratio - a.ratio);
}
