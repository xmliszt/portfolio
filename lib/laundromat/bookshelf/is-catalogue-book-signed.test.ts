import assert from "node:assert/strict";
import { test } from "node:test";

import type { CatalogueBook } from "./catalogue-book";
import { isCatalogueBookSigned } from "./is-catalogue-book-signed";
import { signCatalogueBook } from "./sign-catalogue-book";

const SECRET = "test-secret";

const BOOK: CatalogueBook = {
  source: "openlibrary",
  sourceId: "OL20758187W",
  title: "아몬드",
  subtitle: undefined,
  authors: "Won-Pyung Sohn",
  year: 2020,
  language: undefined,
  coverRef: "11654300",
};

test("isCatalogueBookSigned accepts the book exactly as it was signed", () => {
  const token = signCatalogueBook({ book: BOOK, secret: SECRET });
  assert.equal(
    isCatalogueBookSigned({ book: BOOK, token, secret: SECRET }),
    true
  );
});

test("isCatalogueBookSigned rejects a change to any field, a wrong secret or a malformed token", () => {
  const token = signCatalogueBook({ book: BOOK, secret: SECRET });
  const changes: Partial<CatalogueBook>[] = [
    { source: "googlebooks" },
    { sourceId: "OL1W" },
    { title: "Almond" },
    { subtitle: "a novel" },
    { authors: "Someone else" },
    { year: 2021 },
    { language: "ko" },
    { coverRef: "1" },
  ];
  for (const change of changes) {
    assert.equal(
      isCatalogueBookSigned({
        book: { ...BOOK, ...change },
        token,
        secret: SECRET,
      }),
      false,
      JSON.stringify(change)
    );
  }
  assert.equal(
    isCatalogueBookSigned({ book: BOOK, token, secret: "other" }),
    false
  );
  assert.equal(
    isCatalogueBookSigned({ book: BOOK, token: "short", secret: SECRET }),
    false
  );
});
