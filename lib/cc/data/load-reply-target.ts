import "server-only";

import { pickReplyTarget } from "@/lib/cc/pick-reply-target";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { toOriginalPost } from "@/lib/cc/to-original-post";

import type { PostRow } from "./cc-rows";

/** Return the post a reply or comment should answer: the post its `original_ref` names, else the posted CC post `pickReplyTarget` picks among its parent and sibling replies; `none` for a post that is not a reply; an error when the parent is gone or not posted. */
export async function loadReplyTarget(options: {
  post: PostRow;
}): Promise<
  | { kind: "none" }
  | { kind: "ok"; target: Pick<PostRow, "platform_post_id" | "url"> }
  | { kind: "error"; message: string }
> {
  const post = options.post;
  if (post.kind !== "reply" && post.kind !== "comment") return { kind: "none" };
  if (post.original_ref !== null) {
    return { kind: "ok", target: toOriginalPost(post.original_ref) };
  }
  if (post.parent_post_id === null) {
    return { kind: "error", message: "This reply has no parent post." };
  }
  const supabase = createCcServiceClient();
  const { data: family, error } = await supabase
    .from("posts")
    .select("*")
    .or(
      `id.eq.${post.parent_post_id},parent_post_id.eq.${post.parent_post_id}`
    );
  if (error) throw error;
  const parent = family.find((row) => row.id === post.parent_post_id);
  if (parent === undefined || parent.status !== "posted") {
    return {
      kind: "error",
      message:
        "Its parent post is not live yet, so there is nothing to reply to.",
    };
  }
  const targetId = pickReplyTarget({
    reply: post,
    parentId: parent.id,
    siblings: family.filter((row) => row.parent_post_id === parent.id),
  });
  const target = family.find((row) => row.id === targetId) ?? parent;
  return { kind: "ok", target };
}
