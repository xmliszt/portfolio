"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Move an unposted post to `scheduledAt` with status "scheduled" and its unposted replies and comments by the same amount in one database call, mark it `scheduled_by = 'user'`, turn auto-posting off and clear an earlier auto-post failure, resync their reminders, and return the moved post. */
export async function schedulePost(options: {
  postId: string;
  scheduledAt: string;
}) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: moved, error } = await supabase.rpc("reschedule_post", {
    p_post_id: options.postId,
    p_scheduled_at: new Date(options.scheduledAt).toISOString(),
    p_scheduled_by: "user",
  });
  if (error) throw error;
  const { error: clearError } = await supabase
    .from("posts")
    .update({
      auto_publish: false,
      publish_error: null,
      publish_claimed_at: null,
    })
    .eq("id", options.postId)
    .not("publish_error", "is", null)
    .is("platform_post_id", null);
  if (clearError) throw clearError;
  await Promise.all(
    moved.map((row) =>
      syncPostReminders({
        postId: row.id,
        status: row.status,
        kind: row.kind,
        repostAs: row.repost_as,
        parentPostId: row.parent_post_id,
        campaignId: row.campaign_id,
        scheduledAt: row.scheduled_at,
        postedAt: row.posted_at,
      })
    )
  );
  revalidatePath("/cc", "layout");
  const post = moved.find((row) => row.id === options.postId);
  if (post === undefined)
    throw new Error("The rescheduled post was not returned");
  return post;
}
