import assert from "node:assert/strict";
import { test } from "node:test";

import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import { bedroomConfig } from "./bedroom-config";
import { getDoorPanel } from "./get-door-panel";

const { door, projection } = bedroomConfig;

function parseMatrix(transform: string) {
  const [a, b, c, d, e, f] = transform
    .replace("matrix(", "")
    .replace(")", "")
    .split(" ")
    .map(Number);
  return function apply(x: number, y: number) {
    return { x: a * x + c * y + e, y: b * x + d * y + f };
  };
}

function approximately(
  actual: { x: number; y: number },
  expected: { x: number; y: number }
) {
  assert.ok(
    Math.abs(actual.x - expected.x) < 1e-6,
    `x ${actual.x} vs ${expected.x}`
  );
  assert.ok(
    Math.abs(actual.y - expected.y) < 1e-6,
    `y ${actual.y} vs ${expected.y}`
  );
}

test("lies flat in the wall when shut", () => {
  const panel = getDoorPanel({ angleDeg: 0, door, projection });
  const apply = parseMatrix(panel.transform);
  approximately(
    apply(door.width, door.height),
    projectIsoPoint({ point: { x: 0, y: door.fromY, z: 0 }, projection })
  );
  assert.equal(panel.shade, 0);
});

test("swings the free edge into the room about the hinge", () => {
  const panel = getDoorPanel({ angleDeg: 90, door, projection });
  const apply = parseMatrix(panel.transform);
  const hingeY = door.fromY + door.width;
  approximately(
    apply(0, 0),
    projectIsoPoint({ point: { x: 0, y: hingeY, z: door.height }, projection })
  );
  approximately(
    apply(door.width, door.height),
    projectIsoPoint({ point: { x: door.width, y: hingeY, z: 0 }, projection })
  );
  approximately(panel.edge[0], apply(door.width, door.height));
  assert.ok(Math.abs(panel.shade - 0.35) < 1e-9);
});
