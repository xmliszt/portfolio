import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the stored connection for `provider`, or `undefined` when it is not connected. */
export async function getIntegration(options: { provider: "threads" }) {
  const { data, error } = await createCcServiceClient()
    .from("integrations")
    .select("*")
    .eq("provider", options.provider)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}
