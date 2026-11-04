"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import type { RepostPublishMode } from "@/lib/cc/repost-publish-modes";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type SetRepostModeResult = { kind: "ok" } | { kind: "error"; message: string };

/** Set how an unposted, unclaimed repost goes out (`repost_as`), turn auto-post off so the new mode is checked again before it posts, reopen its unsent "post" reminder, and resync its reminders. */
export async function setRepostMode(options: {
  postId: string;
  mode: RepostPublishMode;
}): Promise<SetRepostModeResult> {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: post, error } = await supabase
    .from("posts")
    .update({
      repost_as: options.mode,
      auto_publish: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", options.postId)
    .eq("kind", "repost")
    .in("status", ["draft", "scheduled"])
    .is("publish_claimed_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (post === null) {
    return {
      kind: "error",
      message: "The post changed while saving. Reload and try again.",
    };
  }
  const { error: reopenError } = await supabase
    .from("reminders")
    .update({ sent_at: null, done_at: null })
    .eq("post_id", post.id)
    .eq("kind", "post")
    .is("telegram_message_id", null);
  if (reopenError) throw reopenError;
  await syncPostReminders({
    postId: post.id,
    status: post.status,
    kind: post.kind,
    repostAs: post.repost_as,
    parentPostId: post.parent_post_id,
    campaignId: post.campaign_id,
    scheduledAt: post.scheduled_at,
    postedAt: post.posted_at,
  });
  revalidatePath("/cc", "layout");
  return { kind: "ok" };
}
