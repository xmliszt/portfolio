import assert from "node:assert/strict";
import { test } from "node:test";

import { fitEntry } from "./fit-entry";
import { wrapEntryText } from "./wrap-entry-text";

function measureByCharacters(text: string) {
  return Array.from(text).length * 10;
}

test("keeps a short line on one line", () => {
  assert.deepEqual(
    wrapEntryText({
      text: "the coffee is bad",
      maxWidthPx: 200,
      measure: measureByCharacters,
    }),
    ["the coffee is bad"]
  );
});

test("breaks at the last space that fits and drops the trailing space", () => {
  assert.deepEqual(
    wrapEntryText({
      text: "third night here this week",
      maxWidthPx: 100,
      measure: measureByCharacters,
    }),
    ["third", "night here", "this week"]
  );
});

test("keeps line breaks, including blank lines", () => {
  assert.deepEqual(
    wrapEntryText({
      text: "hi\n\nbye",
      maxWidthPx: 100,
      measure: measureByCharacters,
    }),
    ["hi", "", "bye"]
  );
});

test("breaks a word wider than the line inside the word", () => {
  assert.deepEqual(
    wrapEntryText({
      text: "ab abcdefghijkl",
      maxWidthPx: 50,
      measure: measureByCharacters,
    }),
    ["ab", "abcde", "fghij", "kl"]
  );
});

test("breaks between CJK characters without spaces", () => {
  assert.deepEqual(
    wrapEntryText({
      text: "洗衣机转啊转我的烦恼",
      maxWidthPx: 40,
      measure: measureByCharacters,
    }),
    ["洗衣机转", "啊转我的", "烦恼"]
  );
});

test("keeps an emoji with its modifiers in one piece", () => {
  const lines = wrapEntryText({
    text: "👍🏽👍🏽👍🏽",
    maxWidthPx: 20,
    measure: (text) =>
      Array.from(new Intl.Segmenter().segment(text)).length * 10,
  });
  assert.deepEqual(lines, ["👍🏽👍🏽", "👍🏽"]);
});

test("uses the measured width, not the character count", () => {
  const measure = (text: string) =>
    Array.from(text).reduce(
      (width, char) => width + (char === "m" ? 30 : 10),
      0
    );
  assert.deepEqual(
    wrapEntryText({ text: "mm ii mm", maxWidthPx: 60, measure }),
    ["mm", "ii", "mm"]
  );
});

test("counts one line for the timestamp and limits an entry to two pages", () => {
  const short = fitEntry({
    text: "hello there",
    maxWidthPx: 100,
    measure: measureByCharacters,
    linesPerPage: 24,
  });
  assert.equal(short.lineCount, 3);
  assert.equal(short.fits, true);

  const long = fitEntry({
    text: "x".repeat(480),
    maxWidthPx: 100,
    measure: measureByCharacters,
    linesPerPage: 24,
  });
  assert.equal(long.lines.length, 48);
  assert.equal(long.lineCount, 49);
  assert.equal(long.fits, false);
});
