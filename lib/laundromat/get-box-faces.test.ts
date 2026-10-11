import assert from "node:assert/strict";
import { test } from "node:test";

import { getBoxFaces } from "./get-box-faces";
import { projectIsoPoint } from "./project-iso-point";

const projection = { unit: 10, origin: { x: 100, y: 50 } };

test("runs the bevel from the left top corner past the near corner to the right one", () => {
  const faces = getBoxFaces({
    position: { x: 1, y: 1, z: 0 },
    size: { w: 2, d: 2, h: 1 },
    projection,
  });
  const nearTop = projectIsoPoint({ point: { x: 3, y: 3, z: 1 }, projection });
  const [start, middle, end] = faces.bevel;
  assert.deepEqual(
    start,
    projectIsoPoint({ point: { x: 1, y: 3, z: 1 }, projection })
  );
  assert.deepEqual(
    end,
    projectIsoPoint({ point: { x: 3, y: 1, z: 1 }, projection })
  );
  assert.ok(middle);
  assert.ok(
    Math.abs(middle.x - nearTop.x) < 1e-9,
    "middle sits above the near corner"
  );
  assert.ok(
    Math.abs(nearTop.y - middle.y - 1.2) < 1e-9,
    "middle is 1.2px inside the near corner"
  );
});
