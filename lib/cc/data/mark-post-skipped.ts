import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { syncPostReminders } from "./sync-post-reminders";

/** Mark an unposted post and its unposted replies and comments as skipped, drop their unsent reminders, and return the skipped post, or `undefined` when there is no unposted post with `postId`. */
export async function markPostSkipped(options: { postId: string }) {
  const supabase = createCcServiceClient();
  const update = { status: "skipped", updated_at: new Date().toISOString() };
  const { data: post, error } = await supabase
    .from("posts")
    .update(update)
    .eq("id", options.postId)
    .neq("status", "posted")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (post === null) return undefined;
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
        repostAs: row.repost_as,
        campaignId: row.campaign_id,
        scheduledAt: row.scheduled_at,
        postedAt: row.posted_at,
      })
    )
  );
  return post;
}
