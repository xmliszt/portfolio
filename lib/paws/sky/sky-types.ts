export type Season = "spring" | "summer" | "autumn" | "winter" | "wet" | "dry";

export type Weather = "clear" | "rain" | "snow";

/** Ink washes the paper takes at one moment: `edge` darkens the sides, `glow` is the light from the sun's side, `corner` warms the bottom left, and `dark` is laid over everything at night. */
export type SkyLight = {
  edge: string;
  edgeAlpha: number;
  glow: string;
  glowAlpha: number;
  corner: string;
  cornerAlpha: number;
  dark: string;
  darkAlpha: number;
};

/** The sky one visitor sees above the room at their local time. */
export type Sky = {
  hour: number;
  season: Season;
  weather: Weather;
  /** Sun height above the horizon in degrees; negative below it. */
  sunElevation: number;
  /** -1 when the sun is on the rising side, 1 on the setting side. */
  sunSide: number;
  /** 0 at night or under cloud to 1 in full sun, for the window patch and the dapples. */
  sunlight: number;
  /** 0 by day to 1 at night, for the street lamp and fireflies. */
  lamp: number;
  light: SkyLight;
};

/** Development-only replacements for the visitor's clock, season and weather. */
export type SkyOverride = {
  hour: number | undefined;
  season: Season | undefined;
  weather: Weather | undefined;
};
