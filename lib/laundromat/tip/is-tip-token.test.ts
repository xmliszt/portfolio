import assert from "node:assert/strict";
import { test } from "node:test";

import { isTipToken } from "./is-tip-token";

test("accepts a stored token", () => {
  assert.equal(
    isTipToken({
      number: 37,
      code: "LC1.ABCDE-FGHJK-12",
      createdAt: "2026-10-19",
    }),
    true
  );
});

test("rejects missing or mistyped fields", () => {
  assert.equal(isTipToken({ number: "37", code: "x", createdAt: "y" }), false);
  assert.equal(isTipToken({ number: 37, code: "x" }), false);
  assert.equal(isTipToken(null), false);
});

test("accepts a spent token and rejects a mistyped spend time", () => {
  const token = { number: 37, code: "x", createdAt: "y" };
  assert.equal(isTipToken({ ...token, spentAt: "2026-10-20" }), true);
  assert.equal(isTipToken({ ...token, spentAt: 1 }), false);
});
