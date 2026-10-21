import assert from "node:assert/strict";
import { test } from "node:test";

import { applySpend } from "./apply-spend";

const token = {
  number: 37,
  code: "x",
  createdAt: "y",
  uses: 6,
  usesLeft: 4,
};

test("records a newer spend", () => {
  assert.deepEqual(
    applySpend({ token, spentAt: "2026-10-21T02:00:00Z", usesLeft: 3 }),
    { ...token, spentAt: "2026-10-21T02:00:00Z", usesLeft: 3 }
  );
});

test("keeps the newer state when an older spend answer arrives late", () => {
  const spent = { ...token, spentAt: "2026-10-21T03:00:00Z", usesLeft: 0 };
  assert.deepEqual(
    applySpend({ token: spent, spentAt: "2026-10-21T02:00:00Z", usesLeft: 1 }),
    spent
  );
});
