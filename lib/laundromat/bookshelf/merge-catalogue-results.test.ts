import assert from "node:assert/strict";
import { test } from "node:test";

import type { CatalogueBook } from "./catalogue-book";
import { getCatalogueMatchKey } from "./get-catalogue-match-key";
import { mergeCatalogueResults } from "./merge-catalogue-results";

function buildBook(
  options: Partial<CatalogueBook> & Pick<CatalogueBook, "sourceId">
): CatalogueBook {
  return {
    source: "openlibrary",
    title: "Title",
    subtitle: undefined,
    authors: "Author",
    year: undefined,
    language: undefined,
    coverRef: undefined,
    ...options,
  };
}

test("mergeCatalogueResults takes the two catalogues in turns, Google Books first, and stops at the limit", () => {
  const merged = mergeCatalogueResults({
    openLibrary: [
      buildBook({ sourceId: "OL1W", title: "A" }),
      buildBook({ sourceId: "OL2W", title: "B" }),
    ],
    googleBooks: [
      buildBook({ source: "googlebooks", sourceId: "gbgbgbgb01", title: "C" }),
    ],
    limit: 2,
  });
  assert.deepEqual(
    merged.map((book) => book.sourceId),
    ["gbgbgbgb01", "OL1W"]
  );
});

test("mergeCatalogueResults keeps the Google Books result when both copies of a book have a cover", () => {
  const merged = mergeCatalogueResults({
    openLibrary: [
      buildBook({
        sourceId: "OL1W",
        title: "活着",
        authors: "余华",
        coverRef: "1",
      }),
    ],
    googleBooks: [
      buildBook({
        source: "googlebooks",
        sourceId: "gbgbgbgb01",
        title: "活着",
        authors: "余华",
        coverRef: "gbgbgbgb01",
      }),
    ],
    limit: 8,
  });
  assert.deepEqual(
    merged.map((book) => book.sourceId),
    ["gbgbgbgb01"]
  );
});

test("mergeCatalogueResults keeps one of two results for the same book, preferring the one with a cover", () => {
  const merged = mergeCatalogueResults({
    openLibrary: [
      buildBook({
        sourceId: "OL1W",
        title: "Almond",
        authors: "Sohn Won-pyung",
      }),
    ],
    googleBooks: [
      buildBook({
        source: "googlebooks",
        sourceId: "gbgbgbgb01",
        title: "ALMOND.",
        authors: "Sohn Won-Pyung, Joosun Lee",
        coverRef: "gbgbgbgb01",
      }),
    ],
    limit: 8,
  });
  assert.deepEqual(
    merged.map((book) => book.sourceId),
    ["gbgbgbgb01"]
  );
});

test("getCatalogueMatchKey keeps CJK and Arabic letters, so those titles never collapse to one key", () => {
  const keys = [
    buildBook({ sourceId: "OL1W", title: "活着", authors: "余华" }),
    buildBook({ sourceId: "OL2W", title: "围城", authors: "钱锺书" }),
    buildBook({
      sourceId: "OL3W",
      title: "موسم الهجرة إلى الشمال",
      authors: "الطيب صالح",
    }),
  ].map(getCatalogueMatchKey);
  assert.equal(new Set(keys).size, 3);
  assert.ok(keys.every((key) => key.length > 2 && !key.startsWith("|")));
});

test("getCatalogueMatchKey falls back to the source id when the title has no letters or digits", () => {
  assert.equal(
    getCatalogueMatchKey(
      buildBook({ sourceId: "OL7W", title: "…", authors: "A" })
    ),
    "openlibrary:OL7W"
  );
});
