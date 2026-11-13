import { timingSafeEqual } from "node:crypto";

import type { CatalogueBook } from "./catalogue-book";
import { signCatalogueBook } from "./sign-catalogue-book";

/** Return `true` if `token` is the signature `signCatalogueBook` gives `book` with `secret`; `false` when any field or the token differs. */
export function isCatalogueBookSigned(options: {
  book: CatalogueBook;
  token: string;
  secret: string;
}) {
  const expected = Buffer.from(
    signCatalogueBook({ book: options.book, secret: options.secret })
  );
  const actual = Buffer.from(options.token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
