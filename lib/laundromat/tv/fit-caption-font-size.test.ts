import assert from "node:assert/strict";
import { test } from "node:test";

import { fitCaptionFontSize } from "./fit-caption-font-size";

test("keeps the largest size when the text fits", () => {
  assert.equal(
    fitCaptionFontSize({ text: "ch 01", maxWidth: 100, maxFontSize: 5 }),
    5
  );
});

test("shrinks Latin text to fit at 0.6 em per character", () => {
  const fontSize = fitCaptionFontSize({
    text: "a".repeat(20),
    maxWidth: 30,
    maxFontSize: 5,
  });
  assert.ok(Math.abs(fontSize - 2.5) < 1e-9, `got ${fontSize}`);
});

test("counts CJK characters as a full em", () => {
  assert.equal(
    fitCaptionFontSize({ text: "深夜城市", maxWidth: 12, maxFontSize: 5 }),
    3
  );
});
