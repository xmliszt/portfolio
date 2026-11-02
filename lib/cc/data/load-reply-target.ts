import "server-only";

import { pickReplyTarget } from "@/lib/cc/pick-reply-target";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import type { PostRow } from "./cc-rows";

/** Return the posted CC post a reply or comment should answer, picked by `pickReplyTarget` among its parent and sibling replies; `undefined` for a post that is not a reply; an error when the parent is gone or not posted. */
export async function loadReplyTarget(options: {
  post: PostRow;
}): Promise<
  | { kind: "none" }
  | { kind: "ok"; target: PostRow }
  | { kind: "error"; message: string }
> {
  const post = options.post;
  if (post.kind !== "reply" && post.kind !== "comment") return { kind: "none" };
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
