import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the X counts of the given keywords from `sinceDay` (`yyyy-MM-dd`) on. */
export async function listKeywordCounts(options: {
  keywordIds: string[];
  sinceDay: string;
}) {
  if (options.keywordIds.length === 0) return [];
  const { data, error } = await createCcServiceClient()
    .from("keyword_counts")
    .select("*")
    .in("keyword_id", options.keywordIds)
    .eq("source", "x")
    .gte("day", options.sinceDay);
  if (error) throw error;
  return data;
}
