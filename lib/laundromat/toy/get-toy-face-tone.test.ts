import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyFaceTone } from "./get-toy-face-tone";

test("paints up-facing faces as tops and side faces from wall to face", () => {
  assert.equal(getToyFaceTone({ x: 0, y: 0, z: 1 }), "top");
  assert.equal(getToyFaceTone({ x: 1, y: 0, z: 0 }), "wall");
  assert.equal(getToyFaceTone({ x: 0, y: 1, z: 0 }), "face");
});
