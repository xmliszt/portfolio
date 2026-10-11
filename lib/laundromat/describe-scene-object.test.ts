import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeSceneObject } from "./describe-scene-object";
import { isInteractiveSceneObject } from "./is-interactive-scene-object";
import { sceneConfig } from "./scene-config";

test("gives every machine, both focus targets, the mat, the mug, the plant and the basket a label and tooltip", () => {
  const interactiveIds = sceneConfig.objects
    .filter((object) => describeSceneObject({ object, copy: en }) !== undefined)
    .map((object) => object.id);
  assert.deepEqual(interactiveIds.toSorted(), [
    "basket",
    "coffee-machine",
    "dryer-1",
    "dryer-2",
    "dryer-3",
    "dryer-4",
    "mat",
    "mug",
    "notebook",
    "plant",
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
  assert.deepEqual(describeSceneObject({ object: washer, copy: en }), {
    label: "Washer 2, free",
    tooltip: "washer 2 · free",
  });
});

test("marks the same objects interactive as it describes", () => {
  for (const object of sceneConfig.objects) {
    assert.equal(
      isInteractiveSceneObject(object),
      describeSceneObject({ object, copy: en }) !== undefined,
      object.id
    );
  }
});
