import { isRepostPublishMode } from "./is-repost-publish-mode";
import type { RepostPublishMode } from "./repost-publish-modes";

/** Return how a post goes out: its `repost_as` for a `kind: "repost"` row, and "post" for every other row. */
export function getRepostMode(post: {
  kind: string;
  repost_as: string;
}): RepostPublishMode {
  return post.kind === "repost" && isRepostPublishMode(post.repost_as)
    ? post.repost_as
    : "post";
}
