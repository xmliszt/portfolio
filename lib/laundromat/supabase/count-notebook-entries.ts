import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

type CountNotebookEntriesOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  notebookId: number;
};

/** Return how many entries notebook `notebookId` holds, hidden ones included. */
export async function countNotebookEntries(
  options: CountNotebookEntriesOptions
) {
  const { count, error } = await options.client
    .from("notebook_entries")
    .select("id", { count: "exact", head: true })
    .eq("notebook_id", options.notebookId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
