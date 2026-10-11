import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeEntranceMat } from "./describe-entrance-mat";

test("the mat leads home only with washed or dried laundry", () => {
  assert.equal(describeEntranceMat({ basket: "folded", copy: en }).ready, true);
  assert.equal(describeEntranceMat({ basket: "wet", copy: en }).ready, true);
  assert.equal(describeEntranceMat({ basket: "dirty", copy: en }).ready, false);
  assert.equal(describeEntranceMat({ basket: "empty", copy: en }).ready, false);
  assert.equal(
    describeEntranceMat({ basket: "dirty", copy: en }).tooltip,
    "the way home · finish your laundry first"
  );
});
