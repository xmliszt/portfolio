import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyRampSegments } from "./get-toy-ramp-segments";

test("shows the riding surface up to the overhang, then only the back", () => {
  const visible = getToyRampSegments().map((segment) => segment.ridesVisible);
  const flips = visible
    .slice(1)
    .filter((isVisible, index) => isVisible !== visible[index]).length;
  assert.equal(visible.at(0), true);
  assert.equal(visible.at(-1), false);
  assert.equal(flips, 1);
});
