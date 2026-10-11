import assert from "node:assert/strict";
import { test } from "node:test";

import { getEntrySpreads } from "./get-entry-spreads";

test("an entry within one page writes on that page's spread", () => {
  assert.deepEqual(
    getEntrySpreads({ page: 3, lineStart: 2, lineCount: 4, linesPerPage: 24 }),
    [1]
  );
});

test("an entry running past the last line also marks the next page's spread", () => {
  assert.deepEqual(
    getEntrySpreads({ page: 1, lineStart: 24, lineCount: 3, linesPerPage: 24 }),
    [0, 1]
  );
});

test("an entry crossing pages within one spread marks it once", () => {
  assert.deepEqual(
    getEntrySpreads({ page: 2, lineStart: 23, lineCount: 4, linesPerPage: 24 }),
    [1]
  );
});
