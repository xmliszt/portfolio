import assert from "node:assert/strict";
import { test } from "node:test";

import { fitsNotebook } from "./fits-notebook";

const book = { linesPerPage: 24, pageCount: 48 };

test("accepts an entry ending on the last line of the last page", () => {
  assert.equal(
    fitsNotebook({ ...book, page: 48, lineStart: 23, lineCount: 2 }),
    true
  );
});

test("rejects an entry running past the last page or off a page", () => {
  assert.equal(
    fitsNotebook({ ...book, page: 48, lineStart: 24, lineCount: 2 }),
    false
  );
  assert.equal(
    fitsNotebook({ ...book, page: 3, lineStart: 25, lineCount: 1 }),
    false
  );
  assert.equal(
    fitsNotebook({ ...book, page: 3, lineStart: 1, lineCount: 49 }),
    false
  );
});
