import type { PostRow } from "./data/cc-rows";
import { isPlatformId } from "./is-platform-id";

/** Return the time, platform and id of each unskipped, scheduled row in `posts` that is a repost in `campaignId`, or a `post` or `repost` outside it. */
export function getOccupiedSlots(options: {
  posts: readonly PostRow[];
  campaignId: string;
}) {
  return options.posts.flatMap((post) => {
    const isTaken =
      post.campaign_id === options.campaignId
        ? post.kind === "repost"
        : post.kind === "post" || post.kind === "repost";
    return isTaken &&
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
      : [];
  });
}
