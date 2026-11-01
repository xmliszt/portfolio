import { getViewsAt24h } from "./get-views-at-24h";
import type { PlatformId } from "./platforms";
import type { StatMetric, StatPost } from "./stats-types";

type TargetPost = StatPost & { target: string | undefined };

/** Return one row per platform and target (subreddit, Threads topic or community) among posted `posts`, with how many were posted, the median +24 h views of those with numbers, and the best +24 h views; sorted by median, highest first, rows without numbers last. */
export function getTargetStats(options: {
  posts: readonly TargetPost[];
  metrics: readonly StatMetric[];
}) {
  const groups = options.posts.reduce<{
    [key: string]: {
      platform: PlatformId;
      target: string;
      posts: TargetPost[];
    };
  }>((acc, post) => {
    const target = post.target?.trim();
    if (target === undefined || target === "" || post.postedAt === undefined) {
      return acc;
    }
    const key = `${post.platform}\u0000${target.toLowerCase()}`;
    const group = acc[key] ?? { platform: post.platform, target, posts: [] };
    return { ...acc, [key]: { ...group, posts: [...group.posts, post] } };
  }, {});

  return Object.values(groups)
    .map((group) => {
      const views = group.posts
        .map((post) =>
          getViewsAt24h({ metrics: options.metrics, postId: post.id })
        )
        .filter((value): value is number => value !== undefined)
        .toSorted((a, b) => a - b);
      const middle = Math.floor(views.length / 2);
      const median =
        views.length === 0
          ? undefined
          : views.length % 2 === 1
            ? views[middle]
            : ((views[middle - 1] ?? 0) + (views[middle] ?? 0)) / 2;
      return {
        platform: group.platform,
        target: group.target,
        posted: group.posts.length,
        median,
        best: views.at(-1),
      };
    })
    .toSorted((a, b) => (b.median ?? -1) - (a.median ?? -1));
}
