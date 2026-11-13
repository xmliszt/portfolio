import assert from "node:assert/strict";
import { test } from "node:test";

import { getObjectsRestingOn } from "./get-objects-resting-on";
import { sceneConfig } from "./scene-config";
import { bedroomConfig } from "./first-visit/bedroom-config";
import { applySceneTheme } from "./themes/apply-scene-theme";
import { themes } from "./themes/themes";

function restingIds(objects: typeof sceneConfig.objects) {
  const base = objects.find((object) => object.id === "bookshelf");
  assert.ok(base);
  return getObjectsRestingOn({ base, objects })
    .map((object) => object.id)
    .toSorted();
}

test("getObjectsRestingOn finds the coffee machine and tip jar on the bookshelf, not the clock on the wall above it", () => {
  assert.deepEqual(restingIds(sceneConfig.objects), [
    "coffee-machine",
    "tip-jar",
  ]);
});

test("getObjectsRestingOn also finds the Halloween pumpkin standing on the coffee machine", () => {
  const { scene } = applySceneTheme({
    scene: sceneConfig,
    bedroom: bedroomConfig,
    theme: themes.halloween,
  });
  assert.deepEqual(restingIds(scene.objects), [
    "coffee-machine",
    "halloween-coffee-pumpkin",
    "tip-jar",
  ]);
});
