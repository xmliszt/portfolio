import assert from "node:assert/strict";
import { test } from "node:test";

import { wrapEntryLines } from "./wrap-entry-lines";

function measureByCharacters(text: string) {
  return Array.from(text).length * 10;
}

test("gives each line its start offset in the text", () => {
  const text = "third night here this week";
  const lines = wrapEntryLines({
    text,
    maxWidthPx: 100,
    measure: measureByCharacters,
  });
  assert.deepEqual(lines, [
    { text: "third", start: 0 },
    { text: "night here", start: 6 },
    { text: "this week", start: 17 },
  ]);
  lines.forEach((line) =>
    assert.equal(
      text.slice(line.start, line.start + line.text.length),
      line.text
    )
  );
});

test("starts a paragraph after its newline, empty ones included", () => {
  assert.deepEqual(
    wrapEntryLines({
      text: "hi\n\n  yo",
      maxWidthPx: 100,
      measure: measureByCharacters,
    }),
    [
      { text: "hi", start: 0 },
      { text: "", start: 3 },
      { text: "  yo", start: 4 },
    ]
  );
});

test("starts each piece of a broken word where it sits in the text", () => {
  assert.deepEqual(
    wrapEntryLines({
      text: "a abcdefgh",
      maxWidthPx: 40,
      measure: measureByCharacters,
    }),
    [
      { text: "a", start: 0 },
      { text: "abcd", start: 2 },
      { text: "efgh", start: 6 },
    ]
  );
});
