"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { buildReplyPost } from "@/lib/cc/build-reply-post";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type AddReplyResult =
  | { kind: "ok"; postId: string }
  | { kind: "error"; message: string };

/** Insert the empty reply `buildReplyPost` returns under `parentId` and return its id, or why the post cannot take one. */
export async function addReply(options: {
  parentId: string;
}): Promise<AddReplyResult> {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: parent, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", options.parentId)
    .single();
  if (error) throw error;
  const { data: replies, error: repliesError } = await supabase
    .from("posts")
    .select("status, scheduled_at")
    .eq("parent_post_id", parent.id)
    .in("kind", ["reply", "comment"]);
  if (repliesError) throw repliesError;
  const reply = buildReplyPost({ parent, replies, now: new Date() });
  if (reply.kind === "error") return reply;
  const { data: saved, error: saveError } = await supabase
    .from("posts")
    .insert(reply.fields)
    .select("id")
    .single();
  if (saveError) throw saveError;
  revalidatePath("/cc", "layout");
  return { kind: "ok", postId: saved.id };
}
