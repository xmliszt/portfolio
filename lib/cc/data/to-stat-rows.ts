import { isPlatformId } from "@/lib/cc/is-platform-id";
import type { StatMetric, StatPost } from "@/lib/cc/stats-types";

import type { PostMetricRow, PostRow } from "./cc-rows";

const CHECKPOINTS = ["1h", "24h", "7d", "extra"] as const;

/** Convert database rows into the plain rows the stats functions take, dropping rows with an unknown platform or checkpoint. */
export function toStatRows(options: {
  posts: PostRow[];
  metrics: PostMetricRow[];
}) {
  const posts = options.posts.flatMap((post): StatPost[] => {
    if (!isPlatformId(post.platform)) return [];
    return [
      {
        id: post.id,
        platform: post.platform,
        kind: post.kind,
        postedAt:
          post.posted_at === null ? undefined : new Date(post.posted_at),
        hashtags: post.hashtags,
        body: post.body,
        variant: post.variant === "chatgpt" ? "chatgpt" : "mine",
        variantGroup: post.variant_group ?? undefined,
      },
    ];
  });
  const metrics = options.metrics.flatMap((metric): StatMetric[] => {
    const checkpoint = CHECKPOINTS.find((value) => value === metric.checkpoint);
    if (checkpoint === undefined) return [];
    return [
      {
        postId: metric.post_id,
        checkpoint,
        capturedAt: new Date(metric.captured_at),
        views: metric.views ?? undefined,
        likes: metric.likes ?? undefined,
        comments: metric.comments ?? undefined,
        shares: metric.shares ?? undefined,
        saves: metric.saves ?? undefined,
        clicks: metric.clicks ?? undefined,
        upvotes: metric.upvotes ?? undefined,
        rank: metric.rank ?? undefined,
      },
    ];
  });
  return { posts, metrics };
}
