import type { CatalogueBook } from "./catalogue-book";

function normalize(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** Return the key under which two search results count as the same book: the normalised title and first author, or the source id when either normalises to nothing. */
export function getCatalogueMatchKey(book: CatalogueBook) {
  const title = normalize(book.title);
  const author = normalize(book.authors.split(",").at(0) ?? "");
  return title === "" || author === ""
    ? `${book.source}:${book.sourceId}`
    : `${title}|${author}`;
}
