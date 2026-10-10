import assert from "node:assert/strict";
import { test } from "node:test";

import { describeSceneObject } from "./describe-scene-object";
import { sceneConfig } from "./scene-config";

test("gives every machine and both focus targets a label and tooltip", () => {
  const interactiveIds = sceneConfig.objects
    .filter((object) => describeSceneObject(object) !== undefined)
    .map((object) => object.id);
  assert.deepEqual(interactiveIds.toSorted(), [
    "coffee-machine",
    "dryer-1",
    "dryer-2",
    "dryer-3",
    "dryer-4",
    "notebook",
    "shelf",
    "tv",
    "washer-1",
    "washer-2",
    "washer-3",
    "washer-4",
  ]);
});

test("numbers machine labels", () => {
  const washer = sceneConfig.objects.find((object) => object.id === "washer-2");
  assert.ok(washer);
  assert.deepEqual(describeSceneObject(washer), {
    label: "Washer 2, free",
    tooltip: "washer 2 · free",
  });
});
