export const RENDER_QUALITIES = ["full", "lite"] as const;

export type RenderQuality = (typeof RENDER_QUALITIES)[number];

export const RENDER_QUALITY_PREFERENCES = [
  "auto",
  ...RENDER_QUALITIES,
] as const;

export type RenderQualityPreference =
  (typeof RENDER_QUALITY_PREFERENCES)[number];
