import assert from "node:assert/strict";
import { test } from "node:test";

import { getCuriosityRate } from "./get-curiosity-rate";

const rate = (
  overrides: Partial<Parameters<typeof getCuriosityRate>[0]> = {}
) =>
  getCuriosityRate({
    curiosity: 0.6,
    distance: 200,
    stillSeconds: 1,
    isOwner: false,
    isAsleep: false,
    ...overrides,
  });

test("a cat is drawn to its owner's finger more than a stranger's", () => {
  assert.ok(rate({ isOwner: true }) > rate({ isOwner: false }));
});

test("still, near fingers interest awake cats more", () => {
  assert.ok(rate({ stillSeconds: 1 }) > rate({ stillSeconds: 0 }));
  assert.ok(rate({ distance: 100 }) > rate({ distance: 400 }));
  assert.ok(rate({ isAsleep: false }) > rate({ isAsleep: true }));
  assert.equal(rate({ distance: 600 }), 0);
});
