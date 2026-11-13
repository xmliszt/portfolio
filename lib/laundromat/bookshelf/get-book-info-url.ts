import type { BookSource } from "./catalogue-book";

/** Return the catalogue page of the book, or `undefined` for a book added by hand. */
export function getBookInfoUrl(options: {
  source: BookSource;
  sourceId: string | undefined;
}) {
  const { sourceId } = options;
  if (sourceId === undefined) return undefined;
  switch (options.source) {
    case "openlibrary":
      return `https://openlibrary.org/works/${sourceId}`;
    case "googlebooks":
      return `https://books.google.com/books?id=${sourceId}`;
    case "manual":
      return undefined;
    default: {
      const unknown: never = options.source;
      return unknown;
    }
  }
}
