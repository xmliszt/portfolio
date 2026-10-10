import assert from "node:assert/strict";
import { test } from "node:test";

import { getFacePlane } from "./get-face-plane";
import { projectIsoPoint } from "./project-iso-point";

const projection = { unit: 10, origin: { x: 100, y: 100 } };

function assertClose(
  actual: { x: number; y: number },
  expected: { x: number; y: number }
) {
  assert.ok(Math.abs(actual.x - expected.x) < 1e-9, `x ${actual.x}`);
  assert.ok(Math.abs(actual.y - expected.y) < 1e-9, `y ${actual.y}`);
}

test("maps front-face pixels along +x and down -z", () => {
  const plane = getFacePlane({
    plane: "front",
    origin: { x: 1, y: 2, z: 3 },
    projection,
  });
  assertClose(
    plane.toScene({ x: 20, y: 10 }),
    projectIsoPoint({ point: { x: 3, y: 2, z: 2 }, projection })
  );
});

test("maps side-face pixels along -y and down -z", () => {
  const plane = getFacePlane({
    plane: "side",
    origin: { x: 1, y: 2, z: 3 },
    projection,
  });
  assertClose(
    plane.toScene({ x: 10, y: 20 }),
    projectIsoPoint({ point: { x: 1, y: 1, z: 1 }, projection })
  );
});

test("maps top-face pixels along +x and +y", () => {
  const plane = getFacePlane({
    plane: "top",
    origin: { x: 1, y: 2, z: 3 },
    projection,
  });
  assertClose(
    plane.toScene({ x: 10, y: 10 }),
    projectIsoPoint({ point: { x: 2, y: 3, z: 3 }, projection })
  );
});
