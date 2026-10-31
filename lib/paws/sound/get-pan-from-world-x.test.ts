import assert from "node:assert/strict";
import { test } from "node:test";

import { getPanFromWorldX } from "./get-pan-from-world-x";

test("maps the world width onto -0.8..0.8", () => {
  assert.equal(getPanFromWorldX(0), -0.8);
  assert.equal(getPanFromWorldX(800), 0);
  assert.equal(getPanFromWorldX(1600), 0.8);
});

test("clamps positions outside the world", () => {
  assert.equal(getPanFromWorldX(-50), -0.8);
  assert.equal(getPanFromWorldX(4000), 0.8);
});
