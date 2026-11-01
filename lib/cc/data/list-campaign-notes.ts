import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the campaign's learnings notes, newest first. */
export async function listCampaignNotes(options: { campaignId: string }) {
  const { data, error } = await createCcServiceClient()
    .from("notes")
    .select("*")
    .eq("campaign_id", options.campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
