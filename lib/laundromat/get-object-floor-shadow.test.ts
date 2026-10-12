import assert from "node:assert/strict";
import { test } from "node:test";

import { getObjectFloorShadow } from "./get-object-floor-shadow";

test("casts a box from its footprint to its top along the light", () => {
  const shadow = getObjectFloorShadow({
    object: {
      id: "dryer-3",
      kind: "dryer",
      number: 3,
      position: { x: 1, y: 0, z: 2 },
      size: { w: 2, d: 1, h: 1 },
    },
    shadow: { x: 2, y: -0.5 },
  });
  assert.deepEqual(shadow?.at(0), [
    { x: 5, y: -1 },
    { x: 7, y: -1 },
    { x: 7, y: 0 },
    { x: 5, y: 0 },
  ]);
  assert.deepEqual(shadow?.at(1), [
    { x: 7, y: -1.5 },
    { x: 9, y: -1.5 },
    { x: 9, y: -0.5 },
    { x: 7, y: -0.5 },
  ]);
  assert.equal(shadow?.length, 6, "two footprints and four sides");
});

test("covers the footprint of a box that stands on the floor", () => {
  const shadow = getObjectFloorShadow({
    object: {
      id: "washer-1",
      kind: "washer",
      number: 1,
      position: { x: 1, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 3 },
    },
    shadow: { x: 2, y: -0.5 },
  });
  assert.deepEqual(shadow?.at(0), [
    { x: 1, y: 0 },
    { x: 3, y: 0 },
    { x: 3, y: 2 },
    { x: 1, y: 2 },
  ]);
});

test("casts only the top of a table, which stands on one column", () => {
  const shadow = getObjectFloorShadow({
    object: {
      id: "table",
      kind: "table",
      position: { x: 0, y: 0, z: 0 },
      size: { w: 2, d: 2, h: 2 },
    },
    shadow: { x: 1, y: 0 },
  });
  assert.equal(
    shadow?.at(0)?.at(0)?.x,
    1.9,
    "starts at the underside of the top"
  );
});

test("casts nothing for the window", () => {
  const shadow = getObjectFloorShadow({
    object: {
      id: "window",
      kind: "window",
      position: { x: 0, y: 6, z: 2 },
      size: { w: 0.3, d: 3, h: 3 },
    },
    shadow: { x: 1, y: 0 },
  });
  assert.equal(shadow, undefined);
});
