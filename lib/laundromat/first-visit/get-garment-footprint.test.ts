import assert from "node:assert/strict";
import { test } from "node:test";

import type { Garment } from "./bedroom-config";
import { getGarmentFootprint } from "./get-garment-footprint";

const projection = { unit: 10, origin: { x: 100, y: 50 } };

function buildGarment(options: { rotateDeg: number }): Garment {
  return {
    kind: "towel",
    name: "towel",
    at: { x: 2, y: 2 },
    rotateDeg: options.rotateDeg,
    scale: { x: 1, y: 1 },
  };
}

test("centres on the projected floor point", () => {
  const footprint = getGarmentFootprint({
    garment: buildGarment({ rotateDeg: 0 }),
    projection,
  });
  assert.deepEqual(footprint.center, { x: 100, y: 70 });
});

test("bounds an unrotated unit square as a floor diamond", () => {
  const { bounds } = getGarmentFootprint({
    garment: buildGarment({ rotateDeg: 0 }),
    projection,
  });
  const halfWidth = Math.cos(Math.PI / 6) * 10;
  assert.ok(Math.abs(bounds.x - (100 - halfWidth)) < 1e-9);
  assert.ok(Math.abs(bounds.width - 2 * halfWidth) < 1e-9);
  assert.ok(Math.abs(bounds.y - 65) < 1e-9);
  assert.ok(Math.abs(bounds.height - 10) < 1e-9);
});

test("rotates the footprint on the floor", () => {
  const { bounds } = getGarmentFootprint({
    garment: buildGarment({ rotateDeg: 45 }),
    projection,
  });
  assert.ok(
    Math.abs(bounds.width - Math.SQRT2 * Math.cos(Math.PI / 6) * 10) < 1e-9
  );
});
