import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return every post in the campaign, ordered by `scheduled_at` with unscheduled drafts last. */
export async function listCampaignPosts(options: { campaignId: string }) {
  const { data, error } = await createCcServiceClient()
    .from("posts")
    .select("*")
    .eq("campaign_id", options.campaignId)
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
