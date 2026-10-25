import assert from "node:assert/strict";
import { test } from "node:test";

import { themes } from "@/lib/laundromat/themes/themes";

import { getPumpkinShape } from "./get-pumpkin-shape";

test("pumpkin surfaces are finite, sorted in depth, and move with their scene placement", () => {
  for (const object of [
    ...themes.halloween.objects,
    ...themes.halloween.bedroom.decorations,
  ]) {
    if (object.kind !== "pumpkin") continue;
    const projection = { unit: 62, origin: { x: 100, y: 200 } };
    const shape = getPumpkinShape({ object, projection });
    assert.ok(shape.facets.length > 100);
    assert.deepEqual(
      shape.facets.map((facet) => facet.depth),
      shape.facets.map((facet) => facet.depth).toSorted((a, b) => a - b)
    );
    assert.doesNotMatch(JSON.stringify(shape), /NaN|Infinity|undefined/);
    const shifted = getPumpkinShape({
      object,
      projection: { ...projection, origin: { x: 125, y: 160 } },
    });
    assert.equal(shifted.center.x - shape.center.x, 25);
    assert.equal(shifted.center.y - shape.center.y, -40);
    assert.equal(shape.cutouts.length, 4);
  }
});
