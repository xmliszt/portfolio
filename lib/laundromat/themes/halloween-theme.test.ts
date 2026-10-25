import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { isInteractiveSceneObject } from "@/lib/laundromat/is-interactive-scene-object";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { applySceneTheme } from "./apply-scene-theme";
import { parseThemePreference } from "./parse-theme-preference";
import { themes } from "./themes";

test("Halloween adds interactive decorations and scenery in both rooms and preserves furniture identities", () => {
  const before = JSON.stringify({ sceneConfig, bedroomConfig });
  const result = applySceneTheme({
    scene: sceneConfig,
    bedroom: bedroomConfig,
    theme: themes.halloween,
  });
  for (const object of sceneConfig.objects) {
    assert.equal(
      result.scene.objects.find((candidate) => candidate.id === object.id),
      object
    );
  }
  const decorations = [
    ...themes.halloween.objects,
    ...result.bedroom.decorations,
  ];
  assert.ok(decorations.length > 0);
  for (const object of decorations) {
    assert.equal(isInteractiveSceneObject(object), object.kind !== "cobweb");
  }
  assert.equal(
    new Set(decorations.map((object) => object.id)).size,
    decorations.length
  );
  assert.equal(result.bedroom.bed, bedroomConfig.bed);
  assert.equal(result.bedroom.garments, bedroomConfig.garments);
  assert.equal(result.bedroom.motion, bedroomConfig.motion);
  assert.equal(result.scene.details.machine, sceneConfig.details.machine);
  assert.equal(result.scene.details.pumpkin, themes.halloween.details.pumpkin);
  assert.equal(JSON.stringify({ sceneConfig, bedroomConfig }), before);
  assert.deepEqual(parseThemePreference("halloween"), {
    kind: "manual",
    themeId: "halloween",
  });
});

test("resolving Default after Halloween leaves no decorations in either room", () => {
  applySceneTheme({
    scene: sceneConfig,
    bedroom: bedroomConfig,
    theme: themes.halloween,
  });
  const result = applySceneTheme({
    scene: sceneConfig,
    bedroom: bedroomConfig,
    theme: themes.classic,
  });
  assert.deepEqual(result.scene.objects, sceneConfig.objects);
  assert.deepEqual(result.bedroom.decorations, []);
});
