import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/**
 * Fetch the notebook that is still being written in, or `null` when there is none.
 */
export async function getCurrentNotebook(
  client: SupabaseClient<LaundromatDatabase>
) {
  const { data, error } = await client
    .from("notebooks")
    .select("*")
    .is("filled_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
