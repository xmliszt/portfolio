import "server-only";

import { cache } from "react";

import { summariseCampaigns } from "@/lib/cc/summarise-campaigns";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { listCampaigns } from "./list-campaigns";

/** Return a summary of every campaign as of the time of the call, active campaigns first. */
export const listCampaignSummaries = cache(async () => {
  const now = new Date();
  const [campaigns, postsResult] = await Promise.all([
    listCampaigns(),
    createCcServiceClient()
      .from("posts")
      .select("*")
      .not("campaign_id", "is", null)
      .eq("variant", "mine")
      .eq("status", "scheduled")
      .gt("scheduled_at", now.toISOString()),
  ]);
  const { data: posts, error } = postsResult;
  if (error) throw error;
  return summariseCampaigns({ campaigns, posts, now });
});
