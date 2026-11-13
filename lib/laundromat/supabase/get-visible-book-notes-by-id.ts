import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch the `id` and `body` of the notes in `noteIds` that are not hidden. */
export async function getVisibleBookNotesById(options: {
  client: SupabaseClient<LaundromatDatabase>;
  noteIds: number[];
}) {
  const { data, error } = await options.client
    .from("book_notes")
    .select("id, body")
    .is("hidden_at", null)
    .in("id", options.noteIds);
  if (error) throw error;
  return data;
}
