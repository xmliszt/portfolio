import assert from "node:assert/strict";
import { test } from "node:test";

import { isChargeableMachineId } from "./is-chargeable-machine-id";

test("accepts washers and dryers only", () => {
  assert.equal(isChargeableMachineId("washer-1"), true);
  assert.equal(isChargeableMachineId("dryer-4"), true);
  assert.equal(isChargeableMachineId("coin-machine"), false);
  assert.equal(isChargeableMachineId("washer-9"), false);
});
