import assert from "node:assert/strict";
import { test } from "node:test";

import { themes } from "@/lib/laundromat/themes/themes";

import { getSkeletonShape } from "./get-skeleton-shape";

test("skeleton meshes retain visible volume and ordered, finite bone and socket faces", () => {
  const object = themes.halloween.objects.find(
    (object) => object.kind === "skeleton"
  );
  assert.ok(object?.kind === "skeleton");
  const shape = getSkeletonShape({
    object,
    projection: { unit: 62, origin: { x: 0, y: 0 } },
  });
  assert.ok(shape.faces.length > 500 && shape.faces.length < 4000);
  assert.equal(new Set(shape.faces.map((face) => face.material)).size, 3);
  assert.equal(new Set(shape.faces.map((face) => face.shade)).size, 4);
  assert.deepEqual(
    shape.faces.map((face) => face.depth),
    shape.faces.map((face) => face.depth).toSorted((a, b) => a - b)
  );
  assert.doesNotMatch(JSON.stringify(shape), /NaN|Infinity|undefined/);
});
