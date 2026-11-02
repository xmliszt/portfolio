"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { publishClaimedPost } from "@/lib/cc/data/publish-claimed-post";
import type { PublishResult } from "@/lib/cc/publish-result";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Claim an unposted X or Threads post and publish it now through the platform's API, whether or not auto-posting is on; return the outcome, or why it was not started. */
export async function publishPostNow(options: {
  postId: string;
}): Promise<PublishResult> {
  await requireCcOwner();
  const now = new Date();
  const supabase = createCcServiceClient();
  const { data: post, error: readError } = await supabase
    .from("posts")
    .select("publish_claimed_at, publish_error")
    .eq("id", options.postId)
    .single();
  if (readError) throw readError;
  if (post.publish_claimed_at !== null && post.publish_error === null) {
    return { kind: "error", message: "CC is posting this right now." };
  }
  const claimQuery = supabase
    .from("posts")
    .update({ publish_claimed_at: now.toISOString(), publish_error: null })
    .eq("id", options.postId)
    .in("status", ["draft", "scheduled"])
    .in("kind", ["post", "repost"])
    .is("platform_post_id", null);
  const { data: claimed, error } = await (
    post.publish_claimed_at === null
      ? claimQuery.is("publish_claimed_at", null)
      : claimQuery
          .eq("publish_claimed_at", post.publish_claimed_at)
          .not("publish_error", "is", null)
  )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (claimed === null) {
    return {
      kind: "error",
      message: "This post is already live, skipped, or being posted.",
    };
  }
  const result = await publishClaimedPost({ post: claimed, now });
  revalidatePath("/cc", "layout");
  return result;
}
