import assert from "node:assert/strict";
import { test } from "node:test";

import { describeHamperBasket } from "./describe-hamper-basket";

test("guides each step of filling the basket", () => {
  assert.equal(
    describeHamperBasket({ count: 0, total: 6 }),
    "toss the clothes from the floor in here"
  );
  assert.equal(
    describeHamperBasket({ count: 3, total: 6 }),
    "3 of 6 in · add more, or head to the door"
  );
  assert.equal(
    describeHamperBasket({ count: 6, total: 6 }),
    "all in · head to the door"
  );
});
