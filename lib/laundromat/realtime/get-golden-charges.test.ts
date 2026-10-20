import assert from "node:assert/strict";
import { test } from "node:test";

import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";

import { getGoldenCharges } from "./get-golden-charges";

const now = Date.UTC(2026, 9, 20, 12);

test("lists own and peer golden washes still running", () => {
  assert.deepEqual(
    getGoldenCharges({
      own: [{ machineId: "washer-1", startedAt: now - 1000 }],
      peers: [
        {
          sessionId: "a",
          visitorId: "peer",
          goldenCharges: [{ machineId: "washer-2", startedAt: now - 2000 }],
        },
        {
          sessionId: "b",
          visitorId: "other",
          goldenCharges: [{ machineId: "washer-1", startedAt: now - 500 }],
        },
      ],
      offsetsMs: {},
      now,
    }),
    [
      { machineId: "washer-1", startedAt: now - 1000, isOwn: true },
      { machineId: "washer-2", startedAt: now - 2000, isOwn: false },
      { machineId: "washer-1", startedAt: now - 500, isOwn: false },
    ]
  );
});

test("drops washes that have ended, shifting peer starts onto the local clock", () => {
  assert.deepEqual(
    getGoldenCharges({
      own: [{ machineId: "washer-1", startedAt: now - GOLDEN_CHARGE_MS.max }],
      peers: [
        {
          sessionId: "a",
          visitorId: "peer",
          goldenCharges: [{ machineId: "washer-2", startedAt: now - 1000 }],
        },
      ],
      offsetsMs: { peer: -GOLDEN_CHARGE_MS.max },
      now,
    }),
    []
  );
});

test("starts a peer wash from a clock that runs ahead no later than now", () => {
  assert.deepEqual(
    getGoldenCharges({
      own: [],
      peers: [
        {
          sessionId: "a",
          visitorId: "peer",
          goldenCharges: [{ machineId: "washer-2", startedAt: now + 50_000 }],
        },
      ],
      offsetsMs: {},
      now,
    }),
    [{ machineId: "washer-2", startedAt: now, isOwn: false }]
  );
});
