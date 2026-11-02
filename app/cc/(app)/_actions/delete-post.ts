"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type DeletePostResult = { kind: "ok" } | { kind: "error"; message: string };

/** Delete a post with its ChatGPT version, and through the database's cascades its replies, comments, reposts, reminders and logged numbers; refuse while CC is posting it. */
export async function deletePost(options: {
  postId: string;
}): Promise<DeletePostResult> {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, status, variant, variant_group, publish_claimed_at, publish_error"
    )
    .eq("id", options.postId)
    .maybeSingle();
  if (error) throw error;
  if (post === null) return { kind: "ok" };
  const isPublishing =
    post.status !== "posted" &&
    post.publish_claimed_at !== null &&
    post.publish_error === null;
  if (isPublishing) {
    return { kind: "error", message: "CC is posting this right now." };
  }
  if (post.variant === "mine" && post.variant_group !== null) {
    const { error: variantError } = await supabase
      .from("posts")
      .delete()
      .eq("variant_group", post.variant_group)
      .eq("variant", "chatgpt");
    if (variantError) throw variantError;
  }
  const deleteQuery = supabase.from("posts").delete().eq("id", post.id);
  const { error: deleteError } = await (post.publish_claimed_at === null
    ? deleteQuery.is("publish_claimed_at", null)
    : deleteQuery.eq("publish_claimed_at", post.publish_claimed_at));
  if (deleteError) throw deleteError;
  revalidatePath("/cc", "layout");
  return { kind: "ok" };
}
