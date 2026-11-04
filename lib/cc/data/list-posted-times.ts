import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return `posted_at` of every main post (any campaign, custom posts excluded) posted at or after `since`. */
export async function listPostedTimes(options: { since: Date }) {
  const { data, error } = await createCcServiceClient()
    .from("posts")
    .select("posted_at")
    .eq("kind", "post")
    .eq("status", "posted")
    .not("campaign_id", "is", null)
    .gte("posted_at", options.since.toISOString());
  if (error) throw error;
  return data.flatMap((row) =>
    row.posted_at === null ? [] : [new Date(row.posted_at)]
  );
}
