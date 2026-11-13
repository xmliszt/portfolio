import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import type { BookSource } from "@/lib/laundromat/bookshelf/catalogue-book";
import {
  isRecommendBookRejection,
  type RecommendBookRejection,
} from "@/lib/laundromat/supabase/bookshelf-types";
import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

type RecommendBookResult =
  | { kind: "placed"; bookId: number; noteId: number; isNewBook: boolean }
  | { kind: "rejected"; reason: RecommendBookRejection };

/**
 * Put `book` on the shelf with the visitor's note through `recommend_book`, or add the note to the book already there from the same catalogue record.
 * Returns `rejected` with the database's reason for validation and rate-limit failures; throws on any other error.
 */
export async function recommendBook(options: {
  client: SupabaseClient<LaundromatDatabase>;
  visitorId: string;
  book: {
    source: BookSource;
    sourceId: string | undefined;
    title: string;
    subtitle: string | undefined;
    authors: string;
    year: number | undefined;
    language: string | undefined;
    coverRef: string | undefined;
  };
  body: string;
  signOff: string | undefined;
}): Promise<RecommendBookResult> {
  const { book } = options;
  const { data, error } = await options.client.rpc("recommend_book", {
    p_visitor_id: options.visitorId,
    p_source: book.source,
    p_source_id: book.sourceId ?? "",
    p_title: book.title,
    p_subtitle: book.subtitle ?? "",
    p_authors: book.authors,
    p_published_year: book.year ?? 0,
    p_language: book.language ?? "",
    p_cover_ref: book.coverRef ?? "",
    p_body: options.body,
    p_sign_off: options.signOff ?? "",
  });
  if (error) {
    if (isRecommendBookRejection(error.message)) {
      return { kind: "rejected", reason: error.message };
    }
    throw error;
  }
  const row = data.at(0);
  if (row === undefined) throw new Error("recommend_book returned no row");
  return {
    kind: "placed",
    bookId: row.book_id,
    noteId: row.note_id,
    isNewBook: row.is_new_book,
  };
}
