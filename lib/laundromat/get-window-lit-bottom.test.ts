import assert from "node:assert/strict";
import { test } from "node:test";

import { getWindowLitBottom } from "./get-window-lit-bottom";

const window = {
  bottom: 2.5,
  top: 5.5,
  street: { oppositeDistance: 12, oppositeHeight: 5.5 },
};

test("keeps the window bottom when the building across the street is below the light", () => {
  assert.equal(getWindowLitBottom({ ...window, shadow: { x: 1, y: 0 } }), 2.5);
});

test("starts higher on the window when the building across the street shades its bottom", () => {
  assert.equal(getWindowLitBottom({ ...window, shadow: { x: 6, y: 0 } }), 3.5);
});

test("returns nothing when the building shades the whole window", () => {
  const litBottom = getWindowLitBottom({
    ...window,
    street: { oppositeDistance: 12, oppositeHeight: 9 },
    shadow: { x: 6, y: 0 },
  });
  assert.equal(litBottom, undefined);
});
