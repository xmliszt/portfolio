import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch up to `limit` books that have a visible note, most ♥ first (newest first among equals) for `most_loved`, newest first for `newest`. */
export async function listShelfBooks(options: {
  client: SupabaseClient<LaundromatDatabase>;
  order: "most_loved" | "newest";
  limit: number;
}) {
  const query = options.client
    .from("books")
    .select("*")
    .gt("visible_note_count", 0);
  const ordered =
    options.order === "most_loved"
      ? query
          .order("vote_count", { ascending: false })
          .order("created_at", { ascending: false })
      : query.order("created_at", { ascending: false });
  const { data, error } = await ordered.limit(options.limit);
  if (error) throw error;
  return data;
}
