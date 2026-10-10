import assert from "node:assert/strict";
import { test } from "node:test";

import { parseHourOverride } from "./parse-hour-override";

test("reads whole and fractional hours", () => {
  assert.equal(parseHourOverride("22"), 22);
  assert.equal(parseHourOverride("9"), 9);
  assert.equal(parseHourOverride("18.5"), 18.5);
  assert.equal(parseHourOverride("0"), 0);
  assert.equal(parseHourOverride("23.99"), 23.99);
});

test("rejects hours outside the day", () => {
  assert.equal(parseHourOverride("24"), undefined);
  assert.equal(parseHourOverride("-1"), undefined);
  assert.equal(parseHourOverride("Infinity"), undefined);
});

test("rejects anything that is not a number", () => {
  assert.equal(parseHourOverride(null), undefined);
  assert.equal(parseHourOverride(undefined), undefined);
  assert.equal(parseHourOverride(""), undefined);
  assert.equal(parseHourOverride(" "), undefined);
  assert.equal(parseHourOverride("abc"), undefined);
  assert.equal(parseHourOverride("22abc"), undefined);
});
