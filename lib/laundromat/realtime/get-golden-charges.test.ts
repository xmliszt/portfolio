import assert from "node:assert/strict";
import { test } from "node:test";

import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";

import { getGoldenCharges } from "./get-golden-charges";

const now = Date.UTC(2026, 9, 20, 12);
const ATTEMPTS = {
  own: "00000000-0000-4000-8000-000000000001",
  peer: "00000000-0000-4000-8000-000000000002",
  other: "00000000-0000-4000-8000-000000000003",
};

test("lists own golden charges and peer charges checked as spent into that machine", () => {
  assert.deepEqual(
    getGoldenCharges({
      own: [
        { machineId: "washer-1", attempt: ATTEMPTS.own, startedAt: now - 1000 },
      ],
      peers: [
        {
          sessionId: "a",
          visitorId: "peer",
          goldenCharges: [
            {
              machineId: "washer-2",
              attempt: ATTEMPTS.peer,
              startedAt: now - 2000,
            },
          ],
        },
      ],
      checks: {
        [ATTEMPTS.peer]: {
          kind: "spent",
          machineId: "washer-2",
          endsAtMs: now + 1000,
        },
      },
      offsetsMs: {},
      now,
    }),
    [
      {
        machineId: "washer-1",
        attempt: ATTEMPTS.own,
        startedAt: now - 1000,
        isOwn: true,
      },
      {
        machineId: "washer-2",
        attempt: ATTEMPTS.peer,
        startedAt: now - 2000,
        isOwn: false,
      },
    ]
  );
});

test("hides peer charges that are unchecked, not spent, spent into another machine or spent too long ago", () => {
  const charge = (attempt: string) => ({
    machineId: "washer-2",
    attempt,
    startedAt: now - 1000,
  });
  assert.deepEqual(
    getGoldenCharges({
      own: [],
      peers: [
        {
          sessionId: "a",
          visitorId: "peer",
          goldenCharges: [
            charge(ATTEMPTS.own),
            charge(ATTEMPTS.peer),
            charge(ATTEMPTS.other),
          ],
        },
        {
          sessionId: "b",
          visitorId: "copier",
          goldenCharges: [
            {
              machineId: "washer-3",
              attempt: "00000000-0000-4000-8000-000000000004",
              startedAt: now - 1000,
            },
          ],
        },
      ],
      checks: {
        [ATTEMPTS.peer]: { kind: "not-spent" },
        [ATTEMPTS.other]: {
          kind: "spent",
          machineId: "washer-2",
          endsAtMs: now,
        },
        "00000000-0000-4000-8000-000000000004": {
          kind: "spent",
          machineId: "washer-1",
          endsAtMs: now + 1000,
        },
      },
      offsetsMs: {},
      now,
    }),
    []
  );
});

test("drops charges that have ended, shifting peer starts onto the local clock", () => {
  assert.deepEqual(
    getGoldenCharges({
      own: [
        {
          machineId: "washer-1",
          attempt: ATTEMPTS.own,
          startedAt: now - GOLDEN_CHARGE_MS.max,
        },
      ],
      peers: [
        {
          sessionId: "a",
          visitorId: "peer",
          goldenCharges: [
            {
              machineId: "washer-2",
              attempt: ATTEMPTS.peer,
              startedAt: now - 1000,
            },
          ],
        },
      ],
      checks: {
        [ATTEMPTS.peer]: {
          kind: "spent",
          machineId: "washer-2",
          endsAtMs: now + 1000,
        },
      },
      offsetsMs: { peer: -GOLDEN_CHARGE_MS.max },
      now,
    }),
    []
  );
});

test("starts a peer charge from a clock that runs ahead no later than now", () => {
  assert.deepEqual(
    getGoldenCharges({
      own: [],
      peers: [
        {
          sessionId: "a",
          visitorId: "peer",
          goldenCharges: [
            {
              machineId: "washer-2",
              attempt: ATTEMPTS.peer,
              startedAt: now + 50_000,
            },
          ],
        },
      ],
      checks: {
        [ATTEMPTS.peer]: {
          kind: "spent",
          machineId: "washer-2",
          endsAtMs: now + 1000,
        },
      },
      offsetsMs: {},
      now,
    }),
    [
      {
        machineId: "washer-2",
        attempt: ATTEMPTS.peer,
        startedAt: now,
        isOwn: false,
      },
    ]
  );
});
