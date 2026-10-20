import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCustomTip } from "./parse-custom-tip";

test("reads dollars and cents inside the allowed range", () => {
  assert.equal(parseCustomTip("3"), 300);
  assert.equal(parseCustomTip("S$7.50"), 750);
  assert.equal(parseCustomTip(" 500 "), 50000);
});

test("rejects amounts outside the range or not numbers", () => {
  assert.equal(parseCustomTip("0.50"), undefined);
  assert.equal(parseCustomTip("501"), undefined);
  assert.equal(parseCustomTip("five"), undefined);
  assert.equal(parseCustomTip("2.555"), undefined);
});
