import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRemoteClock } from "./parse-remote-clock";

test("reads a clock reading", () => {
  assert.deepEqual(
    parseRemoteClock({ sessionId: "s", visitorId: "v", sentAt: 5, extra: 1 }),
    { sessionId: "s", visitorId: "v", sentAt: 5 }
  );
});

test("drops a payload that is not a clock reading", () => {
  assert.equal(parseRemoteClock(undefined), undefined);
  assert.equal(parseRemoteClock({ sessionId: "s", visitorId: "v" }), undefined);
  assert.equal(
    parseRemoteClock({ sessionId: "s", visitorId: "v", sentAt: Number.NaN }),
    undefined
  );
  assert.equal(
    parseRemoteClock({ sessionId: "s".repeat(65), visitorId: "v", sentAt: 1 }),
    undefined
  );
});
