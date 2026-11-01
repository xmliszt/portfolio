import type { PostRow } from "@/lib/cc/data/cc-rows";

import { isComposerTopLevel } from "./is-composer-top-level";

/** Return the top-level `mine` post to open for `postId` (itself for a repost, its parent for a reply, its original for a ChatGPT variant), else the next scheduled one; `focusPostId` is the reply asked for. */
export function getSelectedPost(options: {
  posts: readonly PostRow[];
  postId: string | undefined;
  now: Date;
}) {
  const requested = options.posts.find((post) => post.id === options.postId);
  const original =
    requested?.variant === "chatgpt"
      ? options.posts.find(
          (post) =>
            post.variant === "mine" &&
            post.variant_group === requested.variant_group
        )
      : requested;
  const parent =
    original === undefined || isComposerTopLevel(original)
      ? original
      : options.posts.find((post) => post.id === original.parent_post_id);
  if (parent !== undefined && isComposerTopLevel(parent)) {
    return {
      post: parent,
      focusPostId: original?.id === parent.id ? undefined : original?.id,
    };
  }
  const topLevel = options.posts.filter(isComposerTopLevel);
  const next =
    topLevel.find(
      (post) =>
        post.status === "scheduled" &&
        post.scheduled_at !== null &&
        new Date(post.scheduled_at) >= options.now
    ) ??
    topLevel.find((post) => post.status !== "posted") ??
    topLevel.at(0);
  return { post: next, focusPostId: undefined };
}
