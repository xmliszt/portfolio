import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeMeowText } from "./normalize-meow-text";

test("trims, collapses spaces and lowercases", () => {
  assert.equal(normalizeMeowText("  Tiny   MEOW\n\tplease "), "tiny meow please");
});

test("cuts to 40 characters without a trailing space", () => {
  const cut = normalizeMeowText(`${"a".repeat(39)} bcd`);
  assert.equal(cut, "a".repeat(39));
  assert.equal(normalizeMeowText("b".repeat(60)).length, 40);
});

test("falls back to meow for blank text", () => {
  assert.equal(normalizeMeowText("   "), "meow");
});
