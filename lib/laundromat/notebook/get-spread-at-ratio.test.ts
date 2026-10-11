import assert from "node:assert/strict";
import { test } from "node:test";

import { getSpreadAtRatio } from "./get-spread-at-ratio";

test("each spread owns an equal slot of the track", () => {
  assert.equal(getSpreadAtRatio({ ratio: 0, spreadCount: 25 }), 0);
  assert.equal(getSpreadAtRatio({ ratio: 0.5, spreadCount: 25 }), 12);
  assert.equal(getSpreadAtRatio({ ratio: 0.999, spreadCount: 25 }), 24);
});

test("pointers past either end clamp to the first or last spread", () => {
  assert.equal(getSpreadAtRatio({ ratio: -0.2, spreadCount: 25 }), 0);
  assert.equal(getSpreadAtRatio({ ratio: 1.4, spreadCount: 25 }), 24);
});
