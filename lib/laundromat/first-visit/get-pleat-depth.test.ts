import assert from "node:assert/strict";
import { test } from "node:test";

import { getPleatDepth } from "./get-pleat-depth";

test("folds stand deeper as the rings bunch and flatten when taut", () => {
  const stacked = getPleatDepth({ gap: 0.13, fabric: 0.28 });
  const drawn = getPleatDepth({ gap: 0.25, fabric: 0.28 });
  assert.ok(stacked > drawn * 1.5, `${stacked} vs ${drawn}`);
  assert.equal(getPleatDepth({ gap: 0.3, fabric: 0.28 }), 0);
});
