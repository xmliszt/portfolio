import assert from "node:assert/strict";
import { test } from "node:test";

import { themes } from "@/lib/laundromat/themes/themes";

import { assertFiniteShape } from "./assert-finite-shape";
import { getPoinsettiaShape } from "./get-poinsettia-shape";

test("poinsettia leaves are finite, paint leaves before bracts, and turn when rustled", () => {
  const object = themes.christmas.objects.find(
    (candidate) => candidate.kind === "poinsettia"
  );
  assert.ok(object?.kind === "poinsettia");
  const projection = { unit: 62, origin: { x: 100, y: 200 } };
  const shape = getPoinsettiaShape({ object, projection, rustle: 0 });
  assertFiniteShape(shape);
  const kinds = shape.leaves.map((leaf) => leaf.kind);
  assert.equal(kinds.lastIndexOf("leaf") < kinds.indexOf("bract"), true);
  const rustled = getPoinsettiaShape({ object, projection, rustle: 0.1 });
  assert.notDeepEqual(
    rustled.leaves.map((leaf) => leaf.d),
    shape.leaves.map((leaf) => leaf.d)
  );
});
