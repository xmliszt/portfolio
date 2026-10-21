import assert from "node:assert/strict";
import { test } from "node:test";

import { getTokenUsage } from "./get-token-usage";

test("counts the uses left and takes the latest spend in any order", () => {
  assert.deepEqual(
    getTokenUsage({
      uses: 6,
      spentAts: ["2026-10-21T03:00:00Z", "2026-10-21T01:00:00Z"],
    }),
    { uses: 6, usesLeft: 4, spentAt: "2026-10-21T03:00:00Z" }
  );
});

test("leaves an unspent token with every use and no spend time", () => {
  assert.deepEqual(getTokenUsage({ uses: 2, spentAts: [] }), {
    uses: 2,
    usesLeft: 2,
    spentAt: undefined,
  });
});

test("never goes below 0 uses left", () => {
  assert.equal(getTokenUsage({ uses: 1, spentAts: ["a", "b"] }).usesLeft, 0);
});
