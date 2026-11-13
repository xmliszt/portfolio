import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Fetch the newest `limit` notes of book `bookId` that are not hidden, newest first. */
export async function listVisibleBookNotes(options: {
  client: SupabaseClient<LaundromatDatabase>;
  bookId: number;
  limit: number;
}) {
  const { data, error } = await options.client
    .from("book_notes")
    .select("id, book_id, body, sign_off, created_at")
    .is("hidden_at", null)
    .eq("book_id", options.bookId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(options.limit);
  if (error) throw error;
  return data;
}
