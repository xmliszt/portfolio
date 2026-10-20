import assert from "node:assert/strict";
import { test } from "node:test";

import { getFulfillableTip } from "./get-fulfillable-tip";

const HASH = "a".repeat(64);

const session = (overrides: object = {}) => ({
  id: "cs_test_1",
  payment_status: "paid",
  currency: "sgd",
  amount_total: 500,
  metadata: { token_hash: HASH },
  ...overrides,
});

test("records a paid SGD tip with a token hash", () => {
  assert.deepEqual(getFulfillableTip(session()), {
    sessionId: "cs_test_1",
    amountCents: 500,
    tokenHash: HASH,
  });
});

test("refuses unpaid, foreign-currency, amountless or hashless sessions", () => {
  for (const overrides of [
    { payment_status: "unpaid" },
    { currency: "usd" },
    { amount_total: null },
    { metadata: null },
    { metadata: {} },
    { metadata: { token_hash: HASH.toUpperCase() } },
    { metadata: { token_hash: "abc" } },
  ]) {
    assert.equal(
      getFulfillableTip(session(overrides)),
      undefined,
      JSON.stringify(overrides)
    );
  }
});
