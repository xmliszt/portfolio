import type { PostRow } from "./data/cc-rows";
import { getRepostMode } from "./get-repost-mode";
import { isAutoPublishPlatform } from "./is-auto-publish-platform";

/** `true` if `post` is a `mine` post or quote on an auto-post platform that is not skipped; `false` otherwise. */
export function canTakeReplies(
  post: Pick<PostRow, "platform" | "variant" | "kind" | "repost_as" | "status">
) {
  return (
    isAutoPublishPlatform(post.platform) &&
    post.variant === "mine" &&
    post.status !== "skipped" &&
    (post.kind === "post" || getRepostMode(post) === "quote")
  );
}
