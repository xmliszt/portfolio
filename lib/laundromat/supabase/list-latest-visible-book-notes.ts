import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch the newest note that is not hidden of each book in `bookIds`; books without one are left out. */
export async function listLatestVisibleBookNotes(options: {
  client: SupabaseClient<LaundromatDatabase>;
  bookIds: number[];
}) {
  if (options.bookIds.length === 0) return [];
  const { data, error } = await options.client.rpc(
    "latest_visible_book_notes",
    {
      p_book_ids: options.bookIds,
    }
  );
  if (error) throw error;
  return data;
}
