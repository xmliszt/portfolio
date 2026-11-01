import mean from "lodash/mean.js";

import { getViewsAt24h } from "./get-views-at-24h";
import type { PlatformId } from "./platforms";
import type { StatMetric, StatPost } from "./stats-types";

/** Return the median 24h views of `platformId`'s posts that have them, leaving out `kind = 'repost'` posts, or `undefined` when none do. */
export function getPlatformMedian(options: {
  posts: readonly Pick<StatPost, "id" | "platform" | "kind">[];
  metrics: readonly StatMetric[];
  platformId: PlatformId;
}) {
  const views = options.posts
    .filter(
      (post) => post.platform === options.platformId && post.kind !== "repost"
    )
    .flatMap((post) => {
      const value = getViewsAt24h({
        metrics: options.metrics,
        postId: post.id,
      });
      return value === undefined ? [] : [value];
    })
    .toSorted((a, b) => a - b);
  if (views.length === 0) {
    return undefined;
  }
  const middle = Math.floor(views.length / 2);
  return mean(
    views.length % 2 === 1
      ? views.slice(middle, middle + 1)
      : views.slice(middle - 1, middle + 1)
  );
}
