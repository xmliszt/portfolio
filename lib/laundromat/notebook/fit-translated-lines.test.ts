import assert from "node:assert/strict";
import { test } from "node:test";

import { fitTranslatedLines } from "./fit-translated-lines";

function measureAt(fontSizePx: number) {
  return (text: string) => Array.from(text).length * fontSizePx;
}

test("keeps the base size when the text already fits the rows", () => {
  const fit = fitTranslatedLines({
    text: "hello there",
    rowCount: 1,
    maxWidthPx: 110,
    baseFontSizePx: 10,
    minScale: 0.8,
    measureAt,
  });
  assert.deepEqual(fit, {
    fontSizePx: 10,
    lines: ["hello there"],
    isTruncated: false,
  });
});

test("shrinks one pixel at a time until the text fits the rows", () => {
  const fit = fitTranslatedLines({
    text: "hello there",
    rowCount: 1,
    maxWidthPx: 99,
    baseFontSizePx: 10,
    minScale: 0.8,
    measureAt,
  });
  assert.deepEqual(fit, {
    fontSizePx: 9,
    lines: ["hello there"],
    isTruncated: false,
  });
});

test("cuts the last row with an ellipsis when the smallest size still overflows", () => {
  const fit = fitTranslatedLines({
    text: "one two three four five six",
    rowCount: 2,
    maxWidthPx: 80,
    baseFontSizePx: 10,
    minScale: 0.8,
    measureAt,
  });
  assert.equal(fit.fontSizePx, 8);
  assert.equal(fit.isTruncated, true);
  assert.equal(fit.lines.length, 2);
  assert.equal(fit.lines.at(-1)?.endsWith("…"), true);
  fit.lines.forEach((line) =>
    assert.ok(measureAt(8)(line) <= 80, `"${line}" is wider than the row`)
  );
});

test("never goes below the smallest size", () => {
  const fit = fitTranslatedLines({
    text: "a very long sentence that cannot fit",
    rowCount: 1,
    maxWidthPx: 50,
    baseFontSizePx: 20,
    minScale: 0.8,
    measureAt,
  });
  assert.equal(fit.fontSizePx, 16);
});
