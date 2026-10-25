import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { SceneConfig, SceneObject } from "@/lib/laundromat/scene-config";
import type { TvStation } from "@/lib/laundromat/tv/tv-state";

export type ThemeDefinition = {
  thumbnail: string;
  tvStations?: TvStation[];
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
