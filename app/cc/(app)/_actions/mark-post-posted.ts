"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Mark a post as posted now with its live `url`, close its "post" reminder, and move its reply and log reminders to count from now. */
export async function markPostPosted(options: {
  postId: string;
  url: string | undefined;
}) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const now = new Date().toISOString();
  const { data: post, error } = await supabase
    .from("posts")
    .update({
      status: "posted",
      posted_at: now,
      url: options.url?.trim() || null,
      updated_at: now,
    })
    .eq("id", options.postId)
    .select("*")
    .single();
  if (error) throw error;

  const { error: reminderError } = await supabase
    .from("reminders")
    .update({ done_at: now })
    .eq("post_id", post.id)
    .eq("kind", "post")
    .is("done_at", null);
  if (reminderError) throw reminderError;

  await syncPostReminders({
    postId: post.id,
    status: post.status,
    kind: post.kind,
    scheduledAt: post.scheduled_at ?? now,
    postedAt: post.posted_at,
  });
  revalidatePath("/cc", "layout");
  return post;
}
