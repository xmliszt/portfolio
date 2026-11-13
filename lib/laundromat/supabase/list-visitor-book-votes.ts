import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Return the ids of the books in `bookIds` that `visitorId` has given a ♥. */
export async function listVisitorBookVotes(options: {
  client: SupabaseClient<LaundromatDatabase>;
  visitorId: string;
  bookIds: number[];
}) {
  if (options.bookIds.length === 0) return [];
  const { data, error } = await options.client
    .from("book_votes")
    .select("book_id")
    .eq("visitor_id", options.visitorId)
    .in("book_id", options.bookIds);
  if (error) throw error;
  return data.map((row) => row.book_id);
}
