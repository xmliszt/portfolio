import assert from "node:assert/strict";
import { test } from "node:test";

import { getDropOutcome } from "./get-drop-outcome";

test("charges the machine only for a fresh spend", () => {
  assert.deepEqual(getDropOutcome({ kind: "spent", spentAt: "t" }), {
    spentAt: "t",
    charge: true,
    notice: undefined,
    retry: false,
  });
});

test("records an earlier spend and says when it was used", () => {
  assert.deepEqual(getDropOutcome({ kind: "already-spent", spentAt: "t" }), {
    spentAt: "t",
    charge: false,
    notice: { kind: "used", spentAt: "t" },
    retry: false,
  });
});

test("refuses an unknown token without retrying", () => {
  assert.deepEqual(getDropOutcome({ kind: "unknown" }), {
    spentAt: undefined,
    charge: false,
    notice: { kind: "unknown" },
    retry: false,
  });
});

test("keeps the token and the attempt when the server cannot answer", () => {
  assert.deepEqual(getDropOutcome({ kind: "unavailable" }), {
    spentAt: undefined,
    charge: false,
    notice: { kind: "offline" },
    retry: true,
  });
});
