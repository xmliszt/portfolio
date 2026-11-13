import "server-only";

import type { CatalogueBook } from "./catalogue-book";
import { parseOpenLibraryResults } from "./parse-open-library-results";

const FIELDS = "key,title,subtitle,author_name,first_publish_year,cover_i";
const MIN_QUERY_CHARS = 3;

/** Search Open Library for `query`; returns no books for queries shorter than Open Library accepts, and throws when the request fails or times out. */
export async function searchOpenLibrary(options: {
  query: string;
  limit: number;
  timeoutMs: number;
}): Promise<CatalogueBook[]> {
  if ([...options.query].length < MIN_QUERY_CHARS) return [];
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", options.query);
  url.searchParams.set("limit", String(options.limit));
  url.searchParams.set("fields", FIELDS);
  const response = await fetch(url, {
    headers: { "User-Agent": "laundro.cafe bookshelf (https://laundro.cafe)" },
    signal: AbortSignal.timeout(options.timeoutMs),
  });
  if (!response.ok)
    throw new Error(`Open Library search failed: ${response.status}`);
  return parseOpenLibraryResults(await response.json());
}
