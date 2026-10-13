import assert from "node:assert/strict";
import { test } from "node:test";

import { getRoomDarkness } from "./get-room-darkness";

test("is darkest with no window light and the lamp off", () => {
  const dark = getRoomDarkness({ windowStrength: 0, lampLevel: 0 });
  const lampOn = getRoomDarkness({ windowStrength: 0, lampLevel: 1 });
  const day = getRoomDarkness({ windowStrength: 1, lampLevel: 0 });
  assert.ok(dark > lampOn && lampOn > day, `${dark} ${lampOn} ${day}`);
  assert.equal(day, 0);
  assert.ok(dark <= 0.38, "keeps the shop readable");
});

test("clamps strengths outside 0–1", () => {
  assert.equal(
    getRoomDarkness({ windowStrength: 1.4, lampLevel: 0 }),
    getRoomDarkness({ windowStrength: 1, lampLevel: 0 })
  );
});
