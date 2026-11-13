import type { BookSource } from "./catalogue-book";

/** Return the catalogue's cover image URL for `coverRef`, or `undefined` for a book added by hand or without a cover. */
export function getBookCoverUrl(options: {
  source: BookSource;
  coverRef: string | undefined;
}) {
  const { coverRef } = options;
  if (coverRef === undefined) return undefined;
  switch (options.source) {
    case "openlibrary":
      return /^\d{1,16}$/.test(coverRef)
        ? `https://covers.openlibrary.org/b/id/${coverRef}-M.jpg`
        : undefined;
    case "googlebooks":
      return /^[A-Za-z0-9_-]{8,16}$/.test(coverRef)
        ? `https://books.google.com/books/content?id=${coverRef}&printsec=frontcover&img=1&zoom=1`
        : undefined;
    case "manual":
      return undefined;
    default: {
      const unknown: never = options.source;
      return unknown;
    }
  }
}
