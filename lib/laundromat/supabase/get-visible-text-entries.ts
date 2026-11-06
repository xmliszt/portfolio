import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch the `id` and `body` of the text entries in `entryIds` that are not hidden; doodles and hidden entries are left out. */
export async function getVisibleTextEntries(options: {
  client: SupabaseClient<LaundromatDatabase>;
  entryIds: number[];
}) {
  const { data, error } = await options.client
    .from("notebook_entries")
    .select("id, body")
    .eq("kind", "text")
    .is("hidden_at", null)
    .in("id", options.entryIds);
  if (error) throw error;
  return data;
}
