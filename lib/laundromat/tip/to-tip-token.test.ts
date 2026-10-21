import assert from "node:assert/strict";
import { test } from "node:test";

import { toTipToken } from "./to-tip-token";

const stored = { number: 37, code: "x", createdAt: "y" };

test("reads an unspent token stored without uses as 1 of 1 left", () => {
  assert.deepEqual(toTipToken(stored), { ...stored, uses: 1, usesLeft: 1 });
});

test("reads a spent token stored without uses as 0 of 1 left", () => {
  assert.deepEqual(toTipToken({ ...stored, spentAt: "t" }), {
    ...stored,
    spentAt: "t",
    uses: 1,
    usesLeft: 0,
  });
});

test("keeps the uses a token was stored with", () => {
  assert.deepEqual(
    toTipToken({ ...stored, spentAt: "t", uses: 6, usesLeft: 4 }),
    { ...stored, spentAt: "t", uses: 6, usesLeft: 4 }
  );
});
