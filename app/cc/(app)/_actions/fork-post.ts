"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { buildForkPost } from "@/lib/cc/build-fork-post";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import type { PlatformId } from "@/lib/cc/platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type ForkPostResult =
  | { kind: "ok"; postId: string }
  | { kind: "error"; message: string; openPostId: string | undefined };

/** Save the copy of `postId` on `platformId` that `buildForkPost` returns, as a new row or over a skipped repost, scheduled at `scheduledAt` or as a draft without it, and return its id, or the error with the post to open instead. */
export async function forkPost(options: {
  postId: string;
  platformId: PlatformId;
  scheduledAt: string | undefined;
}): Promise<ForkPostResult> {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: source, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", options.postId)
    .single();
  if (error) throw error;
  const { data: existingRepost, error: repostError } = await supabase
    .from("posts")
    .select("id, status")
    .eq("parent_post_id", source.id)
    .eq("kind", "repost")
    .maybeSingle();
  if (repostError) throw repostError;
  const fork = buildForkPost({
    source,
    platformId: options.platformId,
    existingRepost: existingRepost ?? undefined,
  });
  if (fork.kind === "error") return fork;

  const now = new Date().toISOString();
  const row = {
    ...fork.fields,
    variant: "mine",
    status: options.scheduledAt === undefined ? "draft" : "scheduled",
    scheduled_at:
      options.scheduledAt === undefined
        ? null
        : new Date(options.scheduledAt).toISOString(),
    scheduled_by: "user",
    posted_at: null,
    url: null,
    auto_publish: false,
    publish_claimed_at: null,
    publish_error: null,
    platform_post_id: null,
    updated_at: now,
  };
  const { data: saved, error: saveError } = await (
    fork.kind === "revive"
      ? supabase
          .from("posts")
          .update(row)
          .eq("id", fork.repostId)
          .eq("status", "skipped")
      : supabase.from("posts").insert(row)
  )
    .select("*")
    .maybeSingle();
  if (saveError !== null && saveError.code !== "23505") throw saveError;
  if (saved === null) {
    return {
      kind: "error",
      message: "This post already has a repost. Reload and open that one.",
      openPostId: undefined,
    };
  }

  await syncPostReminders({
    postId: saved.id,
    status: saved.status,
    kind: saved.kind,
    scheduledAt: saved.scheduled_at,
    postedAt: saved.posted_at,
  });
  revalidatePath("/cc", "layout");
  return { kind: "ok", postId: saved.id };
}
