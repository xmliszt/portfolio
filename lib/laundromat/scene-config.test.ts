import assert from "node:assert/strict";
import { test } from "node:test";

import { sceneConfig } from "./scene-config";

test("has four washers and four dryers numbered 1 to 4", () => {
  for (const kind of ["washer", "dryer"]) {
    const numbers = sceneConfig.objects.flatMap((object) =>
      object.kind === kind && "number" in object ? [object.number] : []
    );
    assert.deepEqual(numbers.toSorted(), [1, 2, 3, 4], kind);
  }
});

test("gives every object a unique id", () => {
  const ids = sceneConfig.objects.map((object) => object.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("places every object inside the room", () => {
  const { width, depth, wallHeight } = sceneConfig.room;
  for (const { id, position, size } of sceneConfig.objects) {
    assert.ok(position.x >= 0 && position.x + size.w <= width, `${id} x`);
    assert.ok(position.y >= 0 && position.y + size.d <= depth, `${id} y`);
    assert.ok(position.z >= 0 && position.z + size.h <= wallHeight, `${id} z`);
  }
});

test("points each camera focus target at an existing object", () => {
  const ids = new Set(sceneConfig.objects.map((object) => object.id));
  assert.deepEqual(sceneConfig.camera.focusTargets, {
    shelf: { objectId: "shelf" },
    notebook: { objectId: "notebook" },
  });
  for (const { objectId } of Object.values(sceneConfig.camera.focusTargets)) {
    assert.ok(ids.has(objectId), objectId);
  }
});

test("orders sky keys by hour, starting at midnight, within a day", () => {
  const hours = sceneConfig.sky.keys.map((key) => key.hour);
  assert.equal(hours.at(0), 0);
  assert.deepEqual(
    hours,
    hours.toSorted((a, b) => a - b)
  );
  assert.equal(new Set(hours).size, hours.length);
  assert.ok(hours.every((hour) => hour < 24));
});

test("uses six-digit hex for every token and sky colour", () => {
  const colours = [
    ...Object.values(sceneConfig.tokens),
    ...sceneConfig.sky.keys.flatMap((key) => [key.top, key.horizon]),
  ];
  for (const colour of colours) {
    assert.match(colour, /^#[0-9a-f]{6}$/);
  }
});

test("keeps the amber accent and ground from the guidebook", () => {
  assert.equal(sceneConfig.tokens.bg, "#0c0d0e");
  assert.equal(sceneConfig.tokens.accent, "#ff9a2e");
});
