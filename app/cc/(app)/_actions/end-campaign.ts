"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { markPostSkipped } from "@/lib/cc/data/mark-post-skipped";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Set `campaignId`'s `ended_at` to now when it is null, then mark each of its "draft" and "scheduled" posts skipped with `markPostSkipped`. */
export async function endCampaign(options: { campaignId: string }) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { error } = await supabase
    .from("campaigns")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", options.campaignId)
    .is("ended_at", null);
  if (error) throw error;
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id")
    .eq("campaign_id", options.campaignId)
    .in("status", ["draft", "scheduled"]);
  if (postsError) throw postsError;
  await Promise.all(posts.map((post) => markPostSkipped({ postId: post.id })));
  revalidatePath("/cc", "layout");
}
