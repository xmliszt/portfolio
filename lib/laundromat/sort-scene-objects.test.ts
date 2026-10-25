import assert from "node:assert/strict";
import { test } from "node:test";

import { themes } from "./themes/themes";
import { sceneConfig } from "./scene-config";
import { sortByDepth } from "./sort-by-depth";
import { sortSceneObjects } from "./sort-scene-objects";

test("base furniture keeps its existing paint order", () => {
  assert.deepEqual(
    sortSceneObjects(sceneConfig.objects),
    sortByDepth(sceneConfig.objects)
  );
});

test("hanging ghost paints after the window while foreground furniture stays in front", () => {
  const sorted = sortSceneObjects([
    ...sceneConfig.objects,
    ...themes.halloween.objects,
  ]);
  const ids = sorted.map((object) => object.id);
  assert.ok(ids.indexOf("halloween-ghost") > ids.indexOf("window"));
  assert.ok(ids.indexOf("halloween-ghost") < ids.indexOf("table"));
  assert.ok(
    ids.indexOf("halloween-coffee-pumpkin") > ids.indexOf("coffee-machine")
  );
  assert.ok(ids.indexOf("halloween-dryer-lantern") > ids.indexOf("dryer-3"));
  assert.deepEqual(
    sorted.filter((object) => sceneConfig.objects.includes(object)),
    sortByDepth(sceneConfig.objects)
  );
});

test("missing or circular paint constraints do not lose scene objects", () => {
  const objects = themes.halloween.objects.map((object, index, all) => ({
    ...object,
    paintAfter: all.at((index + 1) % all.length)?.id,
  }));
  assert.equal(sortSceneObjects(objects).length, objects.length);
  assert.equal(
    sortSceneObjects(
      objects.map((object) => ({ ...object, paintAfter: "missing" }))
    ).length,
    objects.length
  );
});
