import type { Database } from "@/lib/laundromat/supabase/__generated__/types";

export type Book = Database["laundro_cafe"]["Tables"]["books"]["Row"];

export type BookNote = Database["laundro_cafe"]["Tables"]["book_notes"]["Row"];

export const RECOMMEND_BOOK_REJECTIONS = [
  "missing_visitor",
  "empty_body",
  "body_too_long",
  "sign_off_too_long",
  "invalid_book",
  "contains_link",
  "rate_limited",
] as const;

export type RecommendBookRejection = (typeof RECOMMEND_BOOK_REJECTIONS)[number];

/** Return `true` if `message` is one of the rejections `recommend_book` raises; `false` when it is any other error. */
export function isRecommendBookRejection(
  message: string
): message is RecommendBookRejection {
  return RECOMMEND_BOOK_REJECTIONS.some((rejection) => rejection === message);
}
