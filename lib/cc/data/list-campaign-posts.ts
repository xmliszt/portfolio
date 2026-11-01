import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the campaign's posts, only those of `variant` when it is set, ordered by `scheduled_at` with unscheduled drafts last. */
export async function listCampaignPosts(options: {
  campaignId: string;
  variant?: "mine" | "chatgpt";
}) {
  const query = createCcServiceClient()
    .from("posts")
    .select("*")
    .eq("campaign_id", options.campaignId);
  const { data, error } = await (
    options.variant === undefined ? query : query.eq("variant", options.variant)
  )
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
