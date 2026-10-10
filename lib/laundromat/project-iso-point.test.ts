import assert from "node:assert/strict";
import { test } from "node:test";

import { projectIsoPoint } from "./project-iso-point";

const projection = { unit: 10, origin: { x: 100, y: 50 } };

function round(point: { x: number; y: number }) {
  return {
    x: Math.round(point.x * 100) / 100,
    y: Math.round(point.y * 100) / 100,
  };
}

test("maps the iso origin to the projection origin", () => {
  assert.deepEqual(
    projectIsoPoint({ point: { x: 0, y: 0, z: 0 }, projection }),
    { x: 100, y: 50 }
  );
});

test("runs +x down-right, +y down-left and +z straight up", () => {
  assert.deepEqual(
    round(projectIsoPoint({ point: { x: 1, y: 0, z: 0 }, projection })),
    { x: 108.66, y: 55 }
  );
  assert.deepEqual(
    round(projectIsoPoint({ point: { x: 0, y: 1, z: 0 }, projection })),
    { x: 91.34, y: 55 }
  );
  assert.deepEqual(
    round(projectIsoPoint({ point: { x: 0, y: 0, z: 1 }, projection })),
    { x: 100, y: 40 }
  );
});
