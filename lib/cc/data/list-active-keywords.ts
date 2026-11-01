import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the keywords that are not archived, oldest first. */
export async function listActiveKeywords() {
  const { data, error } = await createCcServiceClient()
    .from("keywords")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
