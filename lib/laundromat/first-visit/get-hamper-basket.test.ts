import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "./bedroom-config";
import { getHamperBasket } from "./get-hamper-basket";

const basket = getHamperBasket({
  basket: bedroomConfig.basket,
  projection: bedroomConfig.projection,
});

function isInside(point: { x: number; y: number }) {
  const zone = basket.dropZone;
  return (
    point.x >= zone.x &&
    point.x <= zone.x + zone.width &&
    point.y >= zone.y &&
    point.y <= zone.y + zone.height
  );
}

test("puts the mouth above the base and wider than it", () => {
  assert.ok(basket.mouth.y < basket.base.cy);
  assert.ok(basket.top.rx > basket.base.rx);
});

test("accepts drops over the mouth and the body, not across the room", () => {
  assert.ok(isInside(basket.mouth));
  assert.ok(isInside({ x: basket.base.cx, y: basket.base.cy }));
  assert.ok(!isInside({ x: basket.mouth.x + 200, y: basket.mouth.y }));
});
