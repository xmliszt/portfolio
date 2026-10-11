import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeSpread } from "./describe-spread";

test("the first spread pairs the inside cover with page 1", () => {
  assert.equal(
    describeSpread({ spread: 0, pageCount: 48, copy: en }),
    "inside cover · p. 1"
  );
});

test("middle spreads name both pages", () => {
  assert.equal(
    describeSpread({ spread: 6, pageCount: 48, copy: en }),
    "pp. 12–13"
  );
});

test("the last spread of an even page count holds one page", () => {
  assert.equal(
    describeSpread({ spread: 24, pageCount: 48, copy: en }),
    "p. 48"
  );
});
