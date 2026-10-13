"use client";

import { useContext } from "react";

import { RenderQualityContext } from "./render-quality-context";

/** Return the rendering quality the laundromat draws at, the quality detected for this device, the visitor's preference, and the setter that remembers it. */
export function useRenderQuality() {
  return useContext(RenderQualityContext);
}
