import assert from "node:assert/strict";
import { test } from "node:test";

import { keepTrailingSpace } from "./keep-trailing-space";

const measure = (text: string) => text.length;

test("adds the trailing spaces back to the last line", () => {
  assert.deepEqual(
    keepTrailingSpace({
      lines: ["hi", ""],
      text: "hi\n   ",
      maxWidthPx: 20,
      measure,
    }),
    ["hi", "   "]
  );
});

test("leaves lines alone when the text ends without spaces", () => {
  assert.deepEqual(
    keepTrailingSpace({ lines: ["hi"], text: "hi", maxWidthPx: 20, measure }),
    ["hi"]
  );
});

test("leaves lines alone when the spaces would overflow the line", () => {
  assert.deepEqual(
    keepTrailingSpace({
      lines: ["abcd"],
      text: "abcd  ",
      maxWidthPx: 5,
      measure,
    }),
    ["abcd"]
  );
});
