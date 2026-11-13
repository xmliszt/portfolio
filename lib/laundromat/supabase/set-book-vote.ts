import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Give book `bookId` the visitor's ♥ when `loved` is `true` or take it back when `false`, and return the book's new ♥ count; `undefined` when the book does not exist. */
export async function setBookVote(options: {
  client: SupabaseClient<LaundromatDatabase>;
  bookId: number;
  visitorId: string;
  loved: boolean;
}) {
  const { client, bookId, visitorId } = options;
  const { error } = options.loved
    ? await client
        .from("book_votes")
        .upsert(
          { book_id: bookId, visitor_id: visitorId },
          { onConflict: "book_id,visitor_id", ignoreDuplicates: true }
        )
    : await client
        .from("book_votes")
        .delete()
        .eq("book_id", bookId)
        .eq("visitor_id", visitorId);
  if (error?.code === "23503") return undefined;
  if (error) throw error;
  const { data, error: readError } = await client
    .from("books")
    .select("vote_count")
    .eq("id", bookId)
    .maybeSingle();
  if (readError) throw readError;
  return data?.vote_count;
}
