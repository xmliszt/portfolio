"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { parseXCommunityId } from "@/lib/cc/x/parse-x-community-id";

type EditablePostFields = Partial<
  Pick<
    PostRow,
    | "platform"
    | "kind"
    | "parent_post_id"
    | "target"
    | "scheduled_at"
    | "status"
    | "title"
    | "body"
    | "hashtags"
    | "link"
    | "original_ref"
    | "repost_as"
    | "assets"
    | "url"
    | "variant"
    | "variant_group"
    | "wave"
    | "project"
  >
>;

/** Create a post (when `postId` is unset) or update the given fields of `postId`, in `campaignId` or as a custom post when `campaignId` is unset, with an X community link stored as its id and auto-post turned off and its unsent "post" reminder reopened when `original_ref` changes, then resync its reminders; return the saved post. */
export async function savePost(options: {
  postId?: string;
  campaignId: string | undefined;
  fields: EditablePostFields;
}) {
  await requireCcOwner();
  if (
    options.fields.platform !== undefined &&
    !isPlatformId(options.fields.platform)
  ) {
    throw new Error(`Unknown platform ${options.fields.platform}`);
  }
  if (
    options.postId === undefined &&
    options.campaignId === undefined &&
    (options.fields.project ?? "").trim() === ""
  ) {
    throw new Error("A custom post needs a project");
  }
  const target = options.fields.target;
  const fields =
    typeof target === "string" && target.includes("/i/communities/")
      ? { ...options.fields, target: parseXCommunityId(target) ?? target }
      : options.fields;
  const supabase = createCcServiceClient();
  const { data: current, error: currentError } =
    options.postId === undefined ||
    fields.original_ref === undefined ||
    fields.original_ref === null
      ? { data: null, error: null }
      : await supabase
          .from("posts")
          .select("original_ref, auto_publish")
          .eq("id", options.postId)
          .maybeSingle();
  if (currentError) throw currentError;
  const isOriginalChanged =
    current !== null && current.original_ref !== fields.original_ref;
  const query = (() => {
    if (options.postId === undefined) {
      return supabase.from("posts").insert({
        campaign_id: options.campaignId ?? null,
        platform: fields.platform ?? "x",
        ...fields,
      });
    }
    const update = supabase
      .from("posts")
      .update({
        ...fields,
        ...(isOriginalChanged ? { auto_publish: false } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", options.postId);
    return options.campaignId === undefined
      ? update.is("campaign_id", null)
      : update.eq("campaign_id", options.campaignId);
  })();
  const { data: post, error } = await query.select("*").single();
  if (error) throw error;
  if (isOriginalChanged && current.auto_publish) {
    const { error: reopenError } = await supabase
      .from("reminders")
      .update({ sent_at: null, done_at: null })
      .eq("post_id", post.id)
      .eq("kind", "post")
      .is("telegram_message_id", null);
    if (reopenError) throw reopenError;
  }

  await syncPostReminders({
    postId: post.id,
    status: post.status,
    kind: post.kind,
    repostAs: post.repost_as,
    campaignId: post.campaign_id,
    scheduledAt: post.scheduled_at,
    postedAt: post.posted_at,
  });
  revalidatePath("/cc", "layout");
  return post;
}
