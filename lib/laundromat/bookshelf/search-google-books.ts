import "server-only";

import type { CatalogueBook } from "./catalogue-book";
import { parseGoogleBooksResults } from "./parse-google-books-results";

const FIELDS =
  "items(id,volumeInfo(title,subtitle,authors,publishedDate,language,imageLinks/thumbnail))";

/** Search Google Books for `query` with `apiKey`; throws when the request fails, times out or is refused. */
export async function searchGoogleBooks(options: {
  query: string;
  limit: number;
  timeoutMs: number;
  apiKey: string;
}): Promise<CatalogueBook[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", options.query);
  url.searchParams.set("maxResults", String(options.limit));
  url.searchParams.set("printType", "books");
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("key", options.apiKey);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(options.timeoutMs),
  });
  if (!response.ok)
    throw new Error(`Google Books search failed: ${response.status}`);
  return parseGoogleBooksResults(await response.json());
}
