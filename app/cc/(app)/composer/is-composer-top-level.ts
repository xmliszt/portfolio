import type { PostRow } from "@/lib/cc/data/cc-rows";

/** `true` if `post` is a `mine` post with no `parent_post_id`, or a `mine` repost; `false` otherwise. */
export function isComposerTopLevel(post: PostRow) {
  return (
    post.variant === "mine" &&
    (post.parent_post_id === null || post.kind === "repost")
  );
}
