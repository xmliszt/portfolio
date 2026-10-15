import assert from "node:assert/strict";
import { test } from "node:test";

import type { GlassCell } from "./get-window-clouds";
import { getWindowClouds } from "./get-window-clouds";
import { getWindowWeather } from "./get-window-weather";

const cells: [GlassCell, GlassCell] = [
  { x: 0, y: 0, width: 32, height: 20 },
  { x: 35, y: 0, width: 32, height: 20 },
];
const marginPx = 4.5;

function cloudsFor(condition: "cloudy" | "snow" | "rain" | "thunder") {
  return getWindowClouds({
    cover: getWindowWeather(condition).skyCover,
    cells,
    marginPx,
  });
}

test("darkens the clouds as the sky covers over", () => {
  assert.equal(cloudsFor("cloudy").storminess, 0);
  assert.ok(cloudsFor("snow").storminess > 0);
  assert.ok(cloudsFor("rain").storminess > cloudsFor("snow").storminess);
  assert.equal(cloudsFor("thunder").storminess, 1);
});

test("keeps every cloud the margin inside one glass cell", () => {
  for (const cloud of cloudsFor("cloudy").clouds) {
    const { left, right, top } = cloud.bounds;
    const box = {
      left: cloud.x + left * cloud.scale,
      right: cloud.x + right * cloud.scale,
      top: cloud.y + top * cloud.scale,
      bottom: cloud.y,
    };
    const isInside = cells.some(
      (cell) =>
        box.left >= cell.x + marginPx - 1e-9 &&
        box.right <= cell.x + cell.width - marginPx + 1e-9 &&
        box.top >= cell.y + marginPx - 1e-9 &&
        box.bottom <= cell.y + cell.height - marginPx + 1e-9
    );
    assert.ok(isInside, `${cloud.shapeKey} at ${cloud.x},${cloud.y}`);
    assert.ok(cloud.scale > 0, cloud.shapeKey);
  }
});

test("mirrors the puffs of a mirrored cloud", () => {
  const { clouds } = cloudsFor("cloudy");
  const tall = clouds.find((cloud) => cloud.shapeKey === "tall");
  const mirrored = clouds.find((cloud) => cloud.shapeKey === "tall-mirrored");
  assert.deepEqual(
    mirrored?.puffs.map((puff) => puff.x),
    tall?.puffs.map((puff) => -puff.x)
  );
});
