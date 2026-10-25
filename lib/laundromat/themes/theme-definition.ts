import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { SceneConfig, SceneObject } from "@/lib/laundromat/scene-config";

export type ThemeDefinition = {
  thumbnail: string;
  details: Partial<SceneConfig["details"]>;
  tokens: Partial<SceneConfig["tokens"]>;
  dayTokens: Partial<SceneConfig["light"]["dayTokens"]>;
  light: Partial<Omit<SceneConfig["light"], "dayTokens">>;
  colorScheme: "dark" | "light";
  panelShadow: string;
  backdrop: string;
  objects: SceneObject[];
  bedroom: Partial<BedroomConfig>;
};
