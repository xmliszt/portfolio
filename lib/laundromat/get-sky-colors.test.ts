import assert from "node:assert/strict";
import { test } from "node:test";

import { getSkyColors } from "./get-sky-colors";

const keys = [
  { hour: 6, top: "#000000", horizon: "#ffffff" },
  { hour: 12, top: "#ffffff", horizon: "#000000" },
  { hour: 20, top: "#202020", horizon: "#404040" },
];

test("returns a key's colours at that key's hour", () => {
  assert.deepEqual(getSkyColors({ keys, hour: 12 }), {
    top: "#ffffff",
    horizon: "#000000",
  });
});

test("blends linearly between the surrounding keys", () => {
  assert.deepEqual(getSkyColors({ keys, hour: 9 }), {
    top: "#808080",
    horizon: "#808080",
  });
});

test("wraps from the last key to the first across midnight", () => {
  assert.deepEqual(getSkyColors({ keys, hour: 1 }), {
    top: "#101010",
    horizon: "#a0a0a0",
  });
});

test("treats hour 24 as hour 0", () => {
  assert.deepEqual(
    getSkyColors({ keys, hour: 24 }),
    getSkyColors({ keys, hour: 0 })
  );
});
