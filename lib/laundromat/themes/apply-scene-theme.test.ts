import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { applySceneTheme } from "./apply-scene-theme";
import { parseThemePreference } from "./parse-theme-preference";
import type { ThemeDefinition } from "./theme-definition";
import { themes } from "./themes";

test("Classic preserves both rooms", () => {
  assert.deepEqual(
    applySceneTheme({
      scene: sceneConfig,
      bedroom: bedroomConfig,
      theme: themes.classic,
    }),
    { scene: sceneConfig, bedroom: bedroomConfig }
  );
});

test("theme overrides compose both rooms without changing their source or replacing interactive objects", () => {
  const before = JSON.stringify({ sceneConfig, bedroomConfig });
  const theme = {
    ...themes.classic,
    tokens: { accent: "#ff8800" },
    dayTokens: { line: "#ffddaa" },
    light: { lampColor: "#ffaa55" },
    objects: [
      {
        id: "theme-plant",
        kind: "plant",
        position: { x: 1, y: 2, z: 0 },
        size: { w: 1, d: 1, h: 1 },
      },
      { ...sceneConfig.objects[0], position: { x: 100, y: 100, z: 100 } },
    ],
    bedroom: { rug: { ...bedroomConfig.rug, width: 2 } },
  } satisfies ThemeDefinition;
  const result = applySceneTheme({
    scene: sceneConfig,
    bedroom: bedroomConfig,
    theme,
  });
  assert.equal(result.scene.tokens.accent, "#ff8800");
  assert.equal(result.scene.light.dayTokens.line, "#ffddaa");
  assert.equal(result.scene.light.lampColor, "#ffaa55");
  assert.equal(result.scene.objects.length, sceneConfig.objects.length + 1);
  assert.equal(result.scene.objects.at(0), sceneConfig.objects.at(0));
  assert.equal(result.bedroom.rug.width, 2);
  assert.deepEqual(result.bedroom.motion, bedroomConfig.motion);
  assert.equal(JSON.stringify({ sceneConfig, bedroomConfig }), before);
});

test("saved Classic is manual; missing or unsupported saved themes return to Automatic", () => {
  assert.deepEqual(parseThemePreference("classic"), {
    kind: "manual",
    themeId: "classic",
  });
  for (const value of [null, "automatic", "unreleased", "__proto__", {}]) {
    assert.deepEqual(parseThemePreference(value), { kind: "automatic" });
  }
});

test("Light changes color and lighting without replacing either room", () => {
  const result = applySceneTheme({
    scene: sceneConfig,
    bedroom: bedroomConfig,
    theme: themes.light,
  });
  assert.equal(result.scene.tokens.bg, themes.light.tokens.bg);
  assert.equal(
    result.scene.light.darknessScale,
    themes.light.light.darknessScale
  );
  assert.deepEqual(result.scene.objects, sceneConfig.objects);
  assert.deepEqual(result.bedroom.room, bedroomConfig.room);
  assert.deepEqual(result.bedroom.lamp, themes.light.bedroom.lamp);
  assert.deepEqual(parseThemePreference("light"), {
    kind: "manual",
    themeId: "light",
  });
});
