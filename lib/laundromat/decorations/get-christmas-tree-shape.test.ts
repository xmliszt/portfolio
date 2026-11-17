import assert from "node:assert/strict";
import { test } from "node:test";

import { themes } from "@/lib/laundromat/themes/themes";

import { assertFiniteShape } from "./assert-finite-shape";
import { getChristmasTreeShape } from "./get-christmas-tree-shape";

test("tree shapes are finite, narrow toward the star, and move with their scene placement", () => {
  for (const object of [
    ...themes.christmas.objects,
    ...themes.christmas.bedroom.decorations,
  ]) {
    if (object.kind !== "christmas-tree") continue;
    const projection = { unit: 62, origin: { x: 100, y: 200 } };
    const shape = getChristmasTreeShape({ object, projection });
    assertFiniteShape(shape);
    assert.equal(shape.tiers.length, object.potted ? 3 : 4);
    assert.ok(shape.starCenter.y < shape.base.y);
    assert.ok(shape.bulbs.length >= shape.tiers.length * 6);
    const shifted = getChristmasTreeShape({
      object,
      projection: { ...projection, origin: { x: 125, y: 160 } },
    });
    assert.equal(shifted.base.x - shape.base.x, 25);
    assert.equal(shifted.base.y - shape.base.y, -40);
  }
});
