"use server";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { collectUploadedAssets } from "@/lib/cc/collect-uploaded-assets";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the files already uploaded to any post of `postId`'s campaign, or to any custom post when `postId` has no campaign. */
export async function listReusableAssets(options: { postId: string }) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("campaign_id")
    .eq("id", options.postId)
    .single();
  if (postError) throw postError;
  const query = supabase.from("posts").select("assets");
  const { data: posts, error } = await (
    post.campaign_id === null
      ? query.is("campaign_id", null)
      : query.eq("campaign_id", post.campaign_id)
  ).order("created_at", { ascending: false });
  if (error) throw error;
  return collectUploadedAssets(posts.map((row) => row.assets));
}
