import assert from "node:assert/strict";
import { test } from "node:test";

import type { GarmentKind } from "./bedroom-config";
import { pickNudgeGarment } from "./pick-nudge-garment";

const kinds: GarmentKind[] = [
  "tee",
  "jeans",
  "sweater",
  "towel",
  "socks",
  "shirt",
];

test("never nudges the same garment twice in a row", () => {
  let last: GarmentKind | undefined;
  for (let count = 0; count < 4; count += 1) {
    const next = pickNudgeGarment({ kinds, unavailable: [], last, count });
    assert.ok(next !== undefined);
    assert.notEqual(next, last);
    last = next;
  }
});

test("skips garments already in the basket", () => {
  const next = pickNudgeGarment({
    kinds,
    unavailable: ["tee", "jeans", "sweater", "towel"],
    last: "socks",
    count: 1,
  });
  assert.equal(next, "shirt");
});

test("returns nothing when no other garment is on the floor", () => {
  assert.equal(
    pickNudgeGarment({
      kinds: ["tee", "jeans"],
      unavailable: ["jeans"],
      last: "tee",
      count: 0,
    }),
    undefined
  );
});
