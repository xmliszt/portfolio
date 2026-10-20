import assert from "node:assert/strict";
import { test } from "node:test";

import { isPendingTip } from "./is-pending-tip";

test("accepts a stored pending tip and rejects a malformed one", () => {
  assert.equal(
    isPendingTip({ sessionId: "cs_test_a", code: "LC1.x", cents: 500 }),
    true
  );
  assert.equal(isPendingTip({ sessionId: "cs_test_a", code: "LC1.x" }), false);
  assert.equal(isPendingTip("cs_test_a"), false);
});
