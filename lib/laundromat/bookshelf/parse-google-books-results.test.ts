import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGoogleBooksResults } from "./parse-google-books-results";

test("parseGoogleBooksResults reads a volume, keeps the language without its region, and uses the id as the cover reference when it has a thumbnail", () => {
  const [book] = parseGoogleBooksResults({
    items: [
      {
        id: "abcDEF12_-",
        volumeInfo: {
          title: "活着",
          authors: ["余华", "余华"],
          publishedDate: "2012-08-01",
          language: "zh-CN",
          imageLinks: {
            thumbnail: "http://books.google.com/books/content?id=abcDEF12_-",
          },
        },
      },
    ],
  });
  assert.deepEqual(book, {
    source: "googlebooks",
    sourceId: "abcDEF12_-",
    title: "活着",
    subtitle: undefined,
    authors: "余华",
    year: 2012,
    language: "zh",
    coverRef: "abcDEF12_-",
  });
});

test("parseGoogleBooksResults keeps a two-letter language and drops a volume id that does not look like one", () => {
  const books = parseGoogleBooksResults({
    items: [
      { id: "short", volumeInfo: { title: "T", authors: ["A"] } },
      {
        id: "abcdefgh12",
        volumeInfo: { title: "T", authors: ["A"], language: "ko" },
      },
    ],
  });
  assert.deepEqual(
    books.map((book) => [book.sourceId, book.language, book.coverRef]),
    [["abcdefgh12", "ko", undefined]]
  );
});

test("parseGoogleBooksResults returns nothing for an error response or no items", () => {
  assert.deepEqual(parseGoogleBooksResults({ error: { code: 429 } }), []);
  assert.deepEqual(parseGoogleBooksResults({ totalItems: 0 }), []);
});

test("parseGoogleBooksResults keeps the valid items when one item is malformed", () => {
  const books = parseGoogleBooksResults({
    items: [
      { id: "noinfo123" },
      { id: "abcdefgh12", volumeInfo: { title: "T", authors: ["A"] } },
    ],
  });
  assert.deepEqual(
    books.map((book) => book.sourceId),
    ["abcdefgh12"]
  );
});
