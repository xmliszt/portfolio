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
  const { data: claimed, error } = await createCcServiceClient()
    .from("posts")
    .update({ publish_claimed_at: now.toISOString(), publish_error: null })
    .eq("id", options.postId)
    .in("status", ["draft", "scheduled"])
    .in("kind", ["post", "repost"])
    .or("publish_claimed_at.is.null,publish_error.not.is.null")
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
