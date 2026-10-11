import assert from "node:assert/strict";
import { test } from "node:test";

import { getDaylightPatch } from "./get-daylight-patch";

const window = { wallX: 0.3, fromY: 2, toY: 5, reach: 2 };

test("keeps the wall edge on the window and reaches further when the sun is low", () => {
  const noon = getDaylightPatch({
    ...window,
    sun: { progress: 0.5, elevation: 1, color: "#ffffff" },
  });
  const evening = getDaylightPatch({
    ...window,
    sun: { progress: 0.95, elevation: 0.15, color: "#ffffff" },
  });
  assert.deepEqual(noon.slice(0, 2), [
    { x: 0.3, y: 2 },
    { x: 0.3, y: 5 },
  ]);
  assert.equal(noon[2].x, 2.3);
  assert.ok(evening[2].x > noon[2].x, "longer at a low sun");
});

test("slants one way in the morning and the other in the evening", () => {
  const morning = getDaylightPatch({
    ...window,
    sun: { progress: 0.1, elevation: 0.3, color: "#ffffff" },
  });
  const evening = getDaylightPatch({
    ...window,
    sun: { progress: 0.9, elevation: 0.3, color: "#ffffff" },
  });
  assert.ok(morning[2].y < 5, "morning slants toward the back wall");
  assert.ok(evening[2].y > 5, "evening slants toward the front");
});
