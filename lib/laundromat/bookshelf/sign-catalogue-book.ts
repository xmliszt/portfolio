import { createHmac } from "node:crypto";

import type { CatalogueBook } from "./catalogue-book";

/** Return a base64url HMAC-SHA256 with `secret` over every field of `book`. */
export function signCatalogueBook(options: {
  book: CatalogueBook;
  secret: string;
}) {
  const { book } = options;
  const fields = [
    "bookshelf-catalogue-v1",
    book.source,
    book.sourceId,
    book.title,
    book.subtitle ?? "",
    book.authors,
    book.year ?? "",
    book.language ?? "",
    book.coverRef ?? "",
  ];
  return createHmac("sha256", options.secret)
    .update(JSON.stringify(fields))
    .digest("base64url");
}
