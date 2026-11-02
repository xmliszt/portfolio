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
    | "assets"
    | "url"
    | "variant"
    | "variant_group"
    | "wave"
  >
>;

/** Create a post in `campaignId` (when `postId` is unset) or update the given fields of `postId`, with an X community link stored as its id, then resync its reminders; return the saved post. */
export async function savePost(options: {
  postId?: string;
  campaignId: string;
  fields: EditablePostFields;
}) {
  await requireCcOwner();
  if (
    options.fields.platform !== undefined &&
    !isPlatformId(options.fields.platform)
  ) {
    throw new Error(`Unknown platform ${options.fields.platform}`);
  }
  const target = options.fields.target;
  const fields =
    typeof target === "string" && target.includes("/i/communities/")
      ? { ...options.fields, target: parseXCommunityId(target) ?? target }
      : options.fields;
  const supabase = createCcServiceClient();
  const query =
    options.postId === undefined
      ? supabase.from("posts").insert({
          campaign_id: options.campaignId,
          platform: fields.platform ?? "x",
          ...fields,
        })
      : supabase
          .from("posts")
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq("id", options.postId)
          .eq("campaign_id", options.campaignId);
  const { data: post, error } = await query.select("*").single();
  if (error) throw error;

  await syncPostReminders({
    postId: post.id,
    status: post.status,
    kind: post.kind,
    scheduledAt: post.scheduled_at,
    postedAt: post.posted_at,
  });
  revalidatePath("/cc", "layout");
  return post;
}
