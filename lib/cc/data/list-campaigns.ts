import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return every campaign, newest `starts_at` first. */
export async function listCampaigns() {
  const { data, error } = await createCcServiceClient()
    .from("campaigns")
    .select("*")
    .order("starts_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}
