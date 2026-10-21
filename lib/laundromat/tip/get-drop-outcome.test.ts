import assert from "node:assert/strict";
import { test } from "node:test";

import { getDropOutcome } from "./get-drop-outcome";

test("charges the machine only for a fresh spend and says how many uses are left", () => {
  assert.deepEqual(
    getDropOutcome({ kind: "spent", spentAt: "t", usesLeft: 3 }),
    {
      spentAt: "t",
      usesLeft: 3,
      charge: true,
      notice: { kind: "left", usesLeft: 3 },
      retry: false,
    }
  );
});

test("records an earlier spend and says when it was used", () => {
  assert.deepEqual(getDropOutcome({ kind: "already-spent", spentAt: "t" }), {
    spentAt: "t",
    usesLeft: 0,
    charge: false,
    notice: { kind: "used", spentAt: "t" },
    retry: false,
  });
});

test("refuses an unknown token without retrying", () => {
  assert.deepEqual(getDropOutcome({ kind: "unknown" }), {
    spentAt: undefined,
    usesLeft: undefined,
    charge: false,
    notice: { kind: "unknown" },
    retry: false,
  });
});

test("keeps the token and the attempt when the server cannot answer", () => {
  assert.deepEqual(getDropOutcome({ kind: "unavailable" }), {
    spentAt: undefined,
    usesLeft: undefined,
    charge: false,
    notice: { kind: "offline" },
    retry: true,
  });
});
