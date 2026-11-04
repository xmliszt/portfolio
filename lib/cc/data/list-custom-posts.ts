import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the custom posts (`campaign_id` null), only those of `variant` when it is set, ordered by `scheduled_at` with unscheduled drafts last. */
export async function listCustomPosts(options: {
  variant?: "mine" | "chatgpt";
}) {
  const query = createCcServiceClient()
    .from("posts")
    .select("*")
    .is("campaign_id", null);
  const { data, error } = await (
    options.variant === undefined ? query : query.eq("variant", options.variant)
  )
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
