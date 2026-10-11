import assert from "node:assert/strict";
import { test } from "node:test";

import { getFloorHalo } from "./get-floor-halo";
import type { SceneObject } from "./scene-config";

const projection = { unit: 10, origin: { x: 100, y: 50 } };

function buildObject(options: {
  kind: SceneObject["kind"];
  z: number;
}): SceneObject {
  const placement = {
    id: options.kind,
    position: { x: 1, y: 1, z: options.z },
    size: { w: 2, d: 2, h: 1 },
  };
  return options.kind === "washer" || options.kind === "dryer"
    ? { ...placement, kind: options.kind, number: 1 }
    : { ...placement, kind: options.kind };
}

test("draws a box's footprint under a machine on the floor", () => {
  const halo = getFloorHalo({
    object: buildObject({ kind: "washer", z: 0 }),
    projection,
  });
  assert.equal(halo?.kind, "polygon");
});

test("draws an ellipse under round furniture", () => {
  const halo = getFloorHalo({
    object: buildObject({ kind: "table", z: 0 }),
    projection,
  });
  assert.equal(halo?.kind, "ellipse");
});

test("skips lifted, wall-mounted and flat objects", () => {
  assert.equal(
    getFloorHalo({
      object: buildObject({ kind: "washer", z: 2.8 }),
      projection,
    }),
    undefined
  );
  assert.equal(
    getFloorHalo({ object: buildObject({ kind: "tv", z: 0 }), projection }),
    undefined
  );
  assert.equal(
    getFloorHalo({ object: buildObject({ kind: "mat", z: 0 }), projection }),
    undefined
  );
});
