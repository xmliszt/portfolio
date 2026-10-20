import assert from "node:assert/strict";
import { test } from "node:test";

import { getUncheckedAttempts } from "./get-unchecked-attempts";

const ATTEMPTS = {
  a: "00000000-0000-4000-8000-00000000000a",
  b: "00000000-0000-4000-8000-00000000000b",
  c: "00000000-0000-4000-8000-00000000000c",
  d: "00000000-0000-4000-8000-00000000000d",
};

test("lists each peer attempt not yet checked, once", () => {
  assert.deepEqual(
    getUncheckedAttempts({
      peers: [
        {
          sessionId: "s1",
          visitorId: "v1",
          goldenCharges: [
            { machineId: "washer-1", attempt: ATTEMPTS.a, startedAt: 1 },
            { machineId: "washer-2", attempt: ATTEMPTS.b, startedAt: 1 },
          ],
        },
        {
          sessionId: "s2",
          visitorId: "v2",
          goldenCharges: [
            { machineId: "washer-1", attempt: ATTEMPTS.a, startedAt: 1 },
            { machineId: "dryer-1", attempt: ATTEMPTS.c, startedAt: 1 },
            { machineId: "dryer-2", attempt: ATTEMPTS.d, startedAt: 1 },
          ],
        },
        { sessionId: "s3", visitorId: "v3" },
      ],
      checks: {
        [ATTEMPTS.b]: { kind: "not-spent" },
        [ATTEMPTS.c]: { kind: "checking" },
      },
    }),
    [ATTEMPTS.a, ATTEMPTS.d]
  );
});
