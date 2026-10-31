import assert from "node:assert/strict";
import { test } from "node:test";

import { readCodeInput } from "./read-code-input";

test("keeps only digits, up to six", () => {
  assert.equal(readCodeInput("123 456"), "123456");
  assert.equal(readCodeInput("12-34-56-78"), "123456");
  assert.equal(readCodeInput("abc"), "");
  assert.equal(readCodeInput("０12"), "12");
});
