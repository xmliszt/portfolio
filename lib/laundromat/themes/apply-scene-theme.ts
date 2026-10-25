import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import type { ThemeDefinition } from "./theme-definition";

export function applySceneTheme(options: {
  scene: SceneConfig;
  bedroom: BedroomConfig;
  theme: ThemeDefinition;
}) {
  const { scene, bedroom, theme } = options;
  const existingIds = new Set(scene.objects.map((object) => object.id));
  return {
    scene: {
      ...scene,
      details: { ...scene.details, ...theme.details },
      tokens: { ...scene.tokens, ...theme.tokens },
      light: {
        ...scene.light,
        ...theme.light,
        dayTokens: { ...scene.light.dayTokens, ...theme.dayTokens },
      },
      objects: [
        ...scene.objects,
        ...theme.objects.filter((object) => !existingIds.has(object.id)),
      ],
    },
    bedroom: { ...bedroom, ...theme.bedroom },
  };
}
