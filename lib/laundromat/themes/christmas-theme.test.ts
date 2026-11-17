import assert from "node:assert/strict";
import { test } from "node:test";

import { SOUND_SAMPLES } from "@/lib/laundromat/audio/sound-samples";
import { getDecorationSound } from "@/lib/laundromat/decorations/get-decoration-sound";
import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { isInteractiveSceneObject } from "@/lib/laundromat/is-interactive-scene-object";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { applySceneTheme } from "./apply-scene-theme";
import { parseThemePreference } from "./parse-theme-preference";
import { themes } from "./themes";

test("Christmas adds decorations in both rooms, a sound for each tappable one, and preserves furniture identities", () => {
  const before = JSON.stringify({ sceneConfig, bedroomConfig });
  const result = applySceneTheme({
    scene: sceneConfig,
    bedroom: bedroomConfig,
    theme: themes.christmas,
  });
  for (const object of sceneConfig.objects) {
    assert.equal(
      result.scene.objects.find((candidate) => candidate.id === object.id),
      object
    );
  }
  const decorations = [
    ...themes.christmas.objects,
    ...result.bedroom.decorations,
  ];
  assert.ok(result.bedroom.decorations.length > 0);
  for (const object of decorations) {
    const isScenery = object.kind === "garland" || object.kind === "holly";
    assert.equal(isInteractiveSceneObject(object), !isScenery, object.id);
    assert.equal(
      getDecorationSound(object) === undefined,
      isScenery,
      object.id
    );
    if ("paintAfter" in object && object.paintAfter !== undefined) {
      const target = object.paintAfter;
      assert.ok(
        sceneConfig.objects.some((candidate) => candidate.id === target),
        `${object.id} paints after missing ${target}`
      );
    }
  }
  assert.equal(
    new Set(decorations.map((object) => object.id)).size,
    decorations.length
  );
  assert.equal(
    result.scene.details.tv.initialStationId,
    themes.christmas.tvStations.at(0)?.id
  );
  assert.equal(JSON.stringify({ sceneConfig, bedroomConfig }), before);
  assert.deepEqual(parseThemePreference("christmas"), {
    kind: "manual",
    themeId: "christmas",
  });
});

test("the potted tree plays its own chime, quieter than the shop tree's", () => {
  const trees = [
    ...themes.christmas.objects,
    ...themes.christmas.bedroom.decorations,
  ].filter((object) => object.kind === "christmas-tree");
  assert.deepEqual(trees.map(getDecorationSound).toSorted(), [
    "bedroom-tree-chime",
    "tree-lights",
  ]);
  assert.ok(
    SOUND_SAMPLES["bedroom-tree-chime"].gain < SOUND_SAMPLES["tree-lights"].gain
  );
});
