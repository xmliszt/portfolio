"use client";

import { createContext } from "react";

import type {
  RenderQuality,
  RenderQualityPreference,
} from "@/lib/laundromat/render-quality/render-quality";

export type RenderQualitySetting = {
  quality: RenderQuality;
  detected: RenderQuality;
  preference: RenderQualityPreference;
  setPreference: (preference: RenderQualityPreference) => void;
};

export const RenderQualityContext = createContext<RenderQualitySetting>({
  quality: "full",
  detected: "full",
  preference: "auto",
  setPreference: () => {},
});
