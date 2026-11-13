import type { CatalogueBook } from "./catalogue-book";
import { getCatalogueMatchKey } from "./get-catalogue-match-key";

/** Return up to `limit` results taking Open Library and Google Books in turns, keeping one result per `getCatalogueMatchKey` and preferring the one with a cover. */
export function mergeCatalogueResults(options: {
  openLibrary: CatalogueBook[];
  googleBooks: CatalogueBook[];
  limit: number;
}) {
  const longest = Math.max(
    options.openLibrary.length,
    options.googleBooks.length
  );
  const interleaved = Array.from({ length: longest }, (_, i) =>
    [options.openLibrary.at(i), options.googleBooks.at(i)].flatMap((book) =>
      book === undefined ? [] : [book]
    )
  ).flat();
  const kept = interleaved.reduce<CatalogueBook[]>((acc, book) => {
    const key = getCatalogueMatchKey(book);
    const index = acc.findIndex((other) => getCatalogueMatchKey(other) === key);
    if (index === -1) return [...acc, book];
    const existing = acc[index];
    return existing.coverRef === undefined && book.coverRef !== undefined
      ? acc.with(index, book)
      : acc;
  }, []);
  return kept.slice(0, options.limit);
}
