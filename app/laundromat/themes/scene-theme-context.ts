"use client";

import { createContext } from "react";

import type { SceneTokens } from "@/lib/laundromat/scene-config";
import type { ThemeId, ThemePreference } from "@/lib/laundromat/themes/themes";

type SceneTheme = {
  tokens: SceneTokens;
  themeId: ThemeId;
} & (
  | {
      kind: "visitor";
      preference: ThemePreference;
      setPreference: (_preference: ThemePreference) => void;
    }
  | { kind: "preview" }
);

export const SceneThemeContext = createContext<SceneTheme | undefined>(
  undefined
);
