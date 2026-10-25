import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";

import { halloweenTheme } from "./halloween-theme";
import type { ThemeDefinition } from "./theme-definition";

export const themes = {
  classic: {
    details: {},
    thumbnail: "/laundromat/themes/dark.jpg",
    tokens: {},
    dayTokens: {},
    light: {},
    objects: [],
    bedroom: {},
    colorScheme: "dark",
    panelShadow:
      "0 1px 0 rgb(255 255 255 / 0.04) inset, 0 1px 2px rgb(0 0 0 / 0.5), 0 24px 64px rgb(0 0 0 / 0.55)",
    backdrop: "rgb(0 0 0 / 0.45)",
  },
  light: {
    details: {},
    thumbnail: "/laundromat/themes/light.jpg",
    tokens: {
      housingTop: "#f0e9dd",
      housingBottom: "#e2d8c8",
      keyTop: "#fff9ee",
      keyBottom: "#e0d4c2",
      controlEdge: "#a59987",
      well: "#cbbda7",
      glow: "#ff9a2e",
      glowHi: "#ffe1a6",
      display: "#30251b",
      accentInk: "#fff9ee",
      danger: "#ad3024",
      bg: "#eee9df",
      panel: "#faf6ee",
      edge: "#c8bfb1",
      face: "#ded6c9",
      faceTop: "#f4eee3",
      wall: "#e8e0d3",
      wall2: "#d9cfc0",
      shade1: "#c5bbaa",
      shade2: "#d0c6b6",
      recess: "#b4a996",
      line: "#766b5c",
      detail: "#9b8e7b",
      ink: "#443c30",
      inkHi: "#29251e",
      accent: "#a44b13",
      accentHi: "#8e3c09",
      paper: "#fffaf0",
      paperRule: "#d8cdbb",
      inkPen: "#302b24",
      remotePen: "#2b60a5",
    },
    objects: [],
    bedroom: {
      lamp: {
        ...bedroomConfig.lamp,
        glowOpacity: 0.4,
        fillOpacity: 0.38,
        poolOpacity: 0.42,
        bedLightOpacity: 0.8,
      },
    },
    colorScheme: "light",
    light: {
      darknessScale: 0.25,
      lampGlowOpacity: 0.38,
      lampFalloffOpacity: 0.1,
      lampPoolOpacity: 0.42,
      poolIntensity: 1.05,
      daylightPatchStrength: 0.2,
      daylightFillOpacity: 0.04,
      lampColor: "#ffac45",
      daylightColor: "#fff5da",
    },
    dayTokens: {
      edge: "#cfc6b8",
      face: "#e9e2d6",
      faceTop: "#fff9ed",
      wall: "#f2ecdf",
      wall2: "#e4dacc",
      shade1: "#d0c5b4",
      shade2: "#dcd2c2",
      recess: "#beb29f",
      line: "#766b5c",
      detail: "#a29580",
    },
    panelShadow:
      "0 1px 0 rgb(255 255 255 / 0.8) inset, 0 1px 3px rgb(62 44 23 / 0.12), 0 24px 64px rgb(62 44 23 / 0.18)",
    backdrop: "rgb(48 39 26 / 0.24)",
  },
  halloween: halloweenTheme,
} satisfies { [id: string]: ThemeDefinition };

export type ThemeId = keyof typeof themes;

export type ThemePreference =
  | { kind: "automatic" }
  | { kind: "manual"; themeId: ThemeId };
