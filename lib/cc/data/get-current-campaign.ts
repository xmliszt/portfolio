import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the campaign with the latest `starts_at` among those whose `ended_at` is null, else the one with the latest `ended_at`, or `undefined` when there is none. */
export async function getCurrentCampaign() {
  const { data, error } = await createCcServiceClient()
    .from("campaigns")
    .select("*")
    .order("ended_at", { ascending: false, nullsFirst: true })
    .order("starts_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}
