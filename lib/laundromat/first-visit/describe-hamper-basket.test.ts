import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeHamperBasket } from "./describe-hamper-basket";

test("guides each step of filling the basket", () => {
  assert.equal(
    describeHamperBasket({ count: 0, total: 6, copy: en }),
    "toss the clothes from the floor in here"
  );
  assert.equal(
    describeHamperBasket({ count: 3, total: 6, copy: en }),
    "3 of 6 in · add more, or head to the door"
  );
  assert.equal(
    describeHamperBasket({ count: 6, total: 6, copy: en }),
    "all in · head to the door"
  );
});
