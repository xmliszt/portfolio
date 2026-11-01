import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return every metric row for the given posts, oldest first. */
export async function listPostMetrics(options: { postIds: string[] }) {
  if (options.postIds.length === 0) return [];
  const { data, error } = await createCcServiceClient()
    .from("post_metrics")
    .select("*")
    .in("post_id", options.postIds)
    .order("captured_at", { ascending: true });
  if (error) throw error;
  return data;
}
