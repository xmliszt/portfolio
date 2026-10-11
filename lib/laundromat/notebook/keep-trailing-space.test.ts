import assert from "node:assert/strict";
import { test } from "node:test";

import { keepTrailingSpace } from "./keep-trailing-space";

const measure = (text: string) => text.length;

test("adds the trailing spaces back to the last line", () => {
  assert.deepEqual(
    keepTrailingSpace({
      lines: [
        { text: "hi", start: 0 },
        { text: "", start: 3 },
      ],
      text: "hi\n   ",
      maxWidthPx: 20,
      measure,
    }),
    [
      { text: "hi", start: 0 },
      { text: "   ", start: 3 },
    ]
  );
});

test("leaves lines alone when the text ends without spaces", () => {
  assert.deepEqual(
    keepTrailingSpace({
      lines: [{ text: "hi", start: 0 }],
      text: "hi",
      maxWidthPx: 20,
      measure,
    }),
    [{ text: "hi", start: 0 }]
  );
});

test("leaves lines alone when the spaces would overflow the line", () => {
  assert.deepEqual(
    keepTrailingSpace({
      lines: [{ text: "abcd", start: 0 }],
      text: "abcd  ",
      maxWidthPx: 5,
      measure,
    }),
    [{ text: "abcd", start: 0 }]
  );
});
