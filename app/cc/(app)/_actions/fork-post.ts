"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { buildForkPost } from "@/lib/cc/build-fork-post";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import type { PlatformId } from "@/lib/cc/platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type ForkPostResult =
  | { kind: "ok"; postId: string }
  | { kind: "error"; message: string };

/** Copy a post's text, hashtags, link, title and uploaded media into a new post on `platformId` (a repost when the source is posted on the same platform), scheduled at `scheduledAt` or saved as a draft without it, and return the new post's id. */
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
  const { count, error: countError } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("parent_post_id", source.id)
    .eq("kind", "repost");
  if (countError) throw countError;
  const fork = buildForkPost({
    source,
    platformId: options.platformId,
    hasRepost: (count ?? 0) > 0,
  });
  if (fork.kind === "error") return fork;

  const { data: created, error: insertError } = await supabase
    .from("posts")
    .insert({ ...fork.fields, status: "draft", variant: "mine" })
    .select("*")
    .single();
  if (insertError?.code === "23505") {
    return {
      kind: "error",
      message:
        "This post already has a repost. Open that repost and fork it instead.",
    };
  }
  if (insertError) throw insertError;

  if (options.scheduledAt !== undefined) {
    const { data: moved, error: moveError } = await supabase.rpc(
      "reschedule_post",
      {
        p_post_id: created.id,
        p_scheduled_at: new Date(options.scheduledAt).toISOString(),
        p_scheduled_by: "user",
      }
    );
    if (moveError) throw moveError;
    await Promise.all(
      moved.map((row) =>
        syncPostReminders({
          postId: row.id,
          status: row.status,
          kind: row.kind,
          scheduledAt: row.scheduled_at,
          postedAt: row.posted_at,
        })
      )
    );
  }
  revalidatePath("/cc", "layout");
  return { kind: "ok", postId: created.id };
}
