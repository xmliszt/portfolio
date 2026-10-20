import assert from "node:assert/strict";
import { test } from "node:test";

import { settleChargeChecks } from "./settle-charge-checks";

const now = Date.UTC(2026, 9, 20, 12);
const ATTEMPTS = {
  a: "00000000-0000-4000-8000-00000000000a",
  b: "00000000-0000-4000-8000-00000000000b",
  c: "00000000-0000-4000-8000-00000000000c",
};

test("marks attempts as checking and leaves the others", () => {
  assert.deepEqual(
    settleChargeChecks({
      checks: { [ATTEMPTS.c]: { kind: "not-spent" } },
      attempts: [ATTEMPTS.a],
      result: { kind: "checking" },
    }),
    {
      [ATTEMPTS.a]: { kind: "checking" },
      [ATTEMPTS.c]: { kind: "not-spent" },
    }
  );
});

test("records found spends until their remaining time runs out, and the rest as not spent", () => {
  assert.deepEqual(
    settleChargeChecks({
      checks: {
        [ATTEMPTS.a]: { kind: "checking" },
        [ATTEMPTS.b]: { kind: "checking" },
      },
      attempts: [ATTEMPTS.a, ATTEMPTS.b],
      result: {
        kind: "found",
        spends: [
          { attempt: ATTEMPTS.a, machineId: "washer-2", remainingMs: 5000 },
        ],
        now,
      },
    }),
    {
      [ATTEMPTS.a]: {
        kind: "spent",
        machineId: "washer-2",
        endsAtMs: now + 5000,
      },
      [ATTEMPTS.b]: { kind: "not-spent" },
    }
  );
});

test("forgets attempts whose check failed so they are asked again", () => {
  assert.deepEqual(
    settleChargeChecks({
      checks: {
        [ATTEMPTS.a]: { kind: "checking" },
        [ATTEMPTS.c]: { kind: "not-spent" },
      },
      attempts: [ATTEMPTS.a],
      result: { kind: "failed" },
    }),
    { [ATTEMPTS.c]: { kind: "not-spent" } }
  );
});
