import assert from "node:assert/strict";
import { test } from "node:test";

import { getChargeChanges } from "./get-charge-changes";
import { GOLDEN_CHARGE_MS } from "./golden-charge-ms";

const now = Date.UTC(2026, 9, 20, 12);
const ATTEMPT = "00000000-0000-4000-8000-000000000001";

test("marks a charge as run once its own cycle runs", () => {
  assert.deepEqual(
    getChargeChanges({
      charges: [
        { machineId: "washer-1", attempt: ATTEMPT, startedAt: now - 1000 },
      ],
      ownRunningMachineIds: ["washer-1"],
      now,
    }),
    { ran: ["washer-1"], ended: [] }
  );
});

test("ends a charge whose cycle ran and stopped, even after a reload", () => {
  assert.deepEqual(
    getChargeChanges({
      charges: [
        {
          machineId: "washer-1",
          attempt: ATTEMPT,
          startedAt: now - 60_000,
          ranAt: now - 50_000,
        },
      ],
      ownRunningMachineIds: [],
      now,
    }),
    { ran: [], ended: ["washer-1"] }
  );
});

test("keeps a fresh unused charge and ends one left idle too long", () => {
  assert.deepEqual(
    getChargeChanges({
      charges: [
        { machineId: "washer-1", attempt: ATTEMPT, startedAt: now - 1000 },
        {
          machineId: "dryer-1",
          attempt: ATTEMPT,
          startedAt: now - GOLDEN_CHARGE_MS.idle - 1,
        },
      ],
      ownRunningMachineIds: [],
      now,
    }),
    { ran: [], ended: ["dryer-1"] }
  );
});

test("ends any charge past its maximum, running or not", () => {
  assert.deepEqual(
    getChargeChanges({
      charges: [
        {
          machineId: "washer-1",
          attempt: ATTEMPT,
          startedAt: now - GOLDEN_CHARGE_MS.max - 1,
          ranAt: now - 1000,
        },
      ],
      ownRunningMachineIds: ["washer-1"],
      now,
    }),
    { ran: [], ended: ["washer-1"] }
  );
});
