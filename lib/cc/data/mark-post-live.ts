import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { syncPostReminders } from "./sync-post-reminders";

/** Mark a post as posted now with its live `url` and `platformPostId` (a post already posted keeps its `posted_at` and `url`), close its "post" reminder, plan its reply and log reminders from its `posted_at`, and return the post. */
export async function markPostLive(options: {
  postId: string;
  url: string | undefined;
  platformPostId: string | undefined;
}) {
  const supabase = createCcServiceClient();
  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from("posts")
    .update({
      status: "posted",
      posted_at: now,
      url: options.url?.trim() || null,
      ...(options.platformPostId === undefined
        ? {}
        : { platform_post_id: options.platformPostId }),
      updated_at: now,
    })
    .eq("id", options.postId)
    .neq("status", "posted")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  const { data: post, error: readError } =
    updated === null
      ? await supabase
          .from("posts")
          .select("*")
          .eq("id", options.postId)
          .single()
      : { data: updated, error: null };
  if (readError) throw readError;

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

    repostAs: post.repost_as,
    scheduledAt: post.scheduled_at,
    postedAt: post.posted_at,
  });
  return post;
}
