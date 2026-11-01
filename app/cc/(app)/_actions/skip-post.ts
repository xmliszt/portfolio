"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Mark an unposted post and its unposted replies and comments as skipped, drop their unsent reminders, and return the skipped post. */
export async function skipPost(options: { postId: string }) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const update = { status: "skipped", updated_at: new Date().toISOString() };
  const { data: post, error } = await supabase
    .from("posts")
    .update(update)
    .eq("id", options.postId)
    .neq("status", "posted")
    .select("*")
    .single();
  if (error) throw error;
  const { data: children, error: childrenError } = await supabase
    .from("posts")
    .update(update)
    .eq("parent_post_id", post.id)
    .in("kind", ["reply", "comment"])
    .neq("status", "posted")
    .select("*");
  if (childrenError) throw childrenError;

  await Promise.all(
    [post, ...children].map((row) =>
      syncPostReminders({
        postId: row.id,
        status: row.status,
        kind: row.kind,
        scheduledAt: row.scheduled_at,
        postedAt: row.posted_at,
      })
    )
  );
  revalidatePath("/cc", "layout");
  return post;
}
