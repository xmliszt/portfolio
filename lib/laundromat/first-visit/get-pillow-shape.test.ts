import assert from "node:assert/strict";
import { test } from "node:test";

import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import { getPillowShape } from "./get-pillow-shape";

const PROJECTION = { unit: 62, origin: { x: 680, y: 380 } };
const PILLOW = {
  position: { x: 1, y: 2, z: 0.5 },
  size: { w: 1, d: 0.5, h: 0.2 },
  puff: 0.04,
  projection: PROJECTION,
};

test("the top starts at the front-left corner, pinched to half height", () => {
  const corner = projectIsoPoint({
    point: { x: 1, y: 2.5, z: 0.6 },
    projection: PROJECTION,
  });
  assert.ok(getPillowShape(PILLOW).top.startsWith(`M ${corner.x} ${corner.y}`));
});

test("the top is lit below the full height of the pillow", () => {
  const { topZ } = getPillowShape(PILLOW);
  assert.ok(topZ > 0.6 && topZ < 0.7);
});

test("the front and side lenses close on themselves and the seam draws both near edges", () => {
  const shape = getPillowShape(PILLOW);
  assert.ok(shape.front.endsWith("Z") && shape.side.endsWith("Z"));
  assert.equal(shape.seam.match(/M /g)?.length, 2);
});
