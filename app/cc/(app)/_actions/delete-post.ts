"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getDeleteBlocker } from "@/lib/cc/get-delete-blocker";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type DeletePostResult = { kind: "ok" } | { kind: "error"; message: string };

/** Delete `postId` and, for a `mine` post, its `chatgpt` version in the same `variant_group`; refuse when `getDeleteBlocker` names a reason or CC claims the post meanwhile. */
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
  const { data: children, error: childrenError } = await supabase
    .from("posts")
    .select("kind, status, publish_claimed_at, publish_error")
    .eq("parent_post_id", post.id);
  if (childrenError) throw childrenError;
  const blocker = getDeleteBlocker({ post, children });
  if (blocker !== undefined) return { kind: "error", message: blocker };

  const deleteQuery = supabase.from("posts").delete().eq("id", post.id);
  const { data: deleted, error: deleteError } = await (
    post.publish_claimed_at === null
      ? deleteQuery.is("publish_claimed_at", null)
      : deleteQuery.eq("publish_claimed_at", post.publish_claimed_at)
  ).select("id");
  if (deleteError) throw deleteError;
  if (deleted.length === 0) {
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
  revalidatePath("/cc", "layout");
  return { kind: "ok" };
}
