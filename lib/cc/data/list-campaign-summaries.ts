import "server-only";

import { summariseCampaigns } from "@/lib/cc/summarise-campaigns";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { listCampaigns } from "./list-campaigns";

/** Return a summary of every campaign as of `now`, active campaigns first. */
export async function listCampaignSummaries(options: { now: Date }) {
  const [campaigns, { data: posts, error }] = await Promise.all([
    listCampaigns(),
    createCcServiceClient()
      .from("posts")
      .select("*")
      .not("campaign_id", "is", null)
      .eq("variant", "mine")
      .eq("status", "scheduled")
      .gt("scheduled_at", options.now.toISOString()),
  ]);
  if (error) throw error;
  return summariseCampaigns({
    campaigns,
    posts: posts ?? [],
    now: options.now,
  });
}
