import assert from "node:assert/strict";
import { test } from "node:test";

import { getFloorHalo } from "./get-floor-halo";
import { getIsoEllipse } from "./get-iso-ellipse";
import { projectIsoPoint } from "./project-iso-point";
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
  assert.deepEqual(halo, {
    kind: "polygon",
    points: [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 1, y: 3 },
    ].map((corner) =>
      projectIsoPoint({ point: { ...corner, z: 0 }, projection })
    ),
  });
});

test("draws an ellipse under round furniture", () => {
  const halo = getFloorHalo({
    object: buildObject({ kind: "table", z: 0 }),
    projection,
  });
  assert.deepEqual(halo, {
    kind: "ellipse",
    ...getIsoEllipse({ center: { x: 2, y: 2, z: 0 }, radius: 0.8, projection }),
  });
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
