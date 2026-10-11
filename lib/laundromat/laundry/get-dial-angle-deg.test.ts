import assert from "node:assert/strict";
import { test } from "node:test";

import { getDialAngleDeg } from "./get-dial-angle-deg";

test("spreads every detent within one turn, first pointing up", () => {
  assert.equal(getDialAngleDeg({ detent: 0, detentCount: 8 }), -90);
  assert.equal(getDialAngleDeg({ detent: 7, detentCount: 8 }), 190);
  assert.ok(getDialAngleDeg({ detent: 7, detentCount: 8 }) - -90 < 360);
});
