import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the `id` and `campaign_id` of each post in `postIds`. */
export async function listPostCampaignIds(options: {
  postIds: readonly string[];
}) {
  if (options.postIds.length === 0) return [];
  const { data, error } = await createCcServiceClient()
    .from("posts")
    .select("id, campaign_id")
    .in("id", [...options.postIds]);
  if (error) throw error;
  return data;
}
