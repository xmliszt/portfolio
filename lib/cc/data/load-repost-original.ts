import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { toOriginalPost } from "@/lib/cc/to-original-post";

import type { PostRow } from "./cc-rows";

/** Return the live original a `kind: "repost"` row reposts (the post its `original_ref` names, else its `parent_post_id` row followed past plain reposts to the post they repost), or why there is none. */
export async function loadRepostOriginal(options: {
  post: PostRow;
}): Promise<
  | { kind: "ok"; original: Pick<PostRow, "platform_post_id" | "url"> }
  | { kind: "error"; message: string }
> {
  if (options.post.original_ref !== null) {
    return { kind: "ok", original: toOriginalPost(options.post.original_ref) };
  }
  if (options.post.parent_post_id === null) {
    return { kind: "error", message: "This repost has no original post." };
  }
  const { data: original, error } = await createCcServiceClient()
    .from("posts")
    .select("*")
    .eq("id", options.post.parent_post_id)
    .maybeSingle();
  if (error) throw error;
  if (
    original !== null &&
    original.kind === "repost" &&
    original.repost_as === "repost"
  ) {
    return loadRepostOriginal({ post: original });
  }
  if (original === null || original.status !== "posted") {
    return {
      kind: "error",
      message:
        "The original post is not live, so there is nothing to quote or repost.",
    };
  }
  return { kind: "ok", original };
}
