import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSceneLayout } from "./build-scene-layout";
import { sceneConfig } from "./scene-config";

const layout = buildSceneLayout({ config: sceneConfig, unit: 40 });

test("lays out every object from the scene config once", () => {
  assert.deepEqual(
    layout.objects.map(({ object }) => object.id).toSorted(),
    sceneConfig.objects.map((object) => object.id).toSorted()
  );
});

test("paints a stacked washer after the one beneath it", () => {
  const ids = layout.objects.map(({ object }) => object.id);
  assert.ok(ids.indexOf("washer-3") > ids.indexOf("washer-1"));
  assert.ok(ids.indexOf("notebook") > ids.indexOf("table"));
});

test("keeps the room and every object inside the scene size", () => {
  const points = [
    ...layout.floor,
    ...layout.backWall,
    ...layout.leftWall,
    ...layout.objects.flatMap(({ faces }) => faces.outline),
  ];
  for (const point of points) {
    assert.ok(point.x >= -1e-9 && point.x <= layout.size.width + 1e-9);
    assert.ok(point.y >= -1e-9 && point.y <= layout.size.height + 1e-9);
  }
});

test("draws one grout line per inner floor unit", () => {
  const { width, depth } = sceneConfig.room;
  assert.equal(layout.gridLines.length, width - 1 + depth - 1);
});

test("gives the TV and the coffee machine their in-place controls", () => {
  const controlIds = layout.objects
    .filter(
      ({ object }) => object.kind === "tv" || object.kind === "coffee-machine"
    )
    .flatMap(({ controls }) => controls.map((control) => control.id));
  assert.deepEqual(controlIds.toSorted(), [
    "coffee-machine-switch",
    "tv-power",
    "tv-screen",
    "tv-tuner",
    "tv-volume",
  ]);
});
