import assert from "node:assert/strict";
import { test } from "node:test";

import { getBookCoverUrl } from "./get-book-cover-url";

test("getBookCoverUrl builds catalogue image URLs only from well-formed references", () => {
  assert.equal(
    getBookCoverUrl({ source: "openlibrary", coverRef: "11654300" }),
    "https://covers.openlibrary.org/b/id/11654300-M.jpg"
  );
  assert.equal(
    getBookCoverUrl({ source: "googlebooks", coverRef: "abcDEF12_-" }),
    "https://books.google.com/books/content?id=abcDEF12_-&printsec=frontcover&img=1&zoom=1"
  );
  assert.equal(
    getBookCoverUrl({ source: "openlibrary", coverRef: "1/../x" }),
    undefined
  );
  assert.equal(
    getBookCoverUrl({ source: "googlebooks", coverRef: "a&b=c" }),
    undefined
  );
  assert.equal(
    getBookCoverUrl({ source: "manual", coverRef: "123" }),
    undefined
  );
  assert.equal(
    getBookCoverUrl({ source: "openlibrary", coverRef: undefined }),
    undefined
  );
});
