import { mixHex } from "@/lib/paws/render/mix-hex";
import { clamp } from "@/lib/paws/sim/clamp";
import { smoothstep } from "@/lib/paws/sim/smoothstep";

import type { SkyLight, Weather } from "./sky-types";

type LightKey = { elevation: number } & SkyLight;

const KEYS = [
  {
    elevation: -18,
    edge: "#2b3a63",
    edgeAlpha: 0.3,
    glow: "#82d8d5",
    glowAlpha: 0.06,
    corner: "#765ba7",
    cornerAlpha: 0.12,
    dark: "#1c2550",
    darkAlpha: 0.56,
  },
  {
    elevation: -8,
    edge: "#765ba7",
    edgeAlpha: 0.3,
    glow: "#ff8e91",
    glowAlpha: 0.22,
    corner: "#3d5588",
    cornerAlpha: 0.14,
    dark: "#2c3a78",
    darkAlpha: 0.4,
  },
  {
    elevation: -2,
    edge: "#765ba7",
    edgeAlpha: 0.26,
    glow: "#ff6c2f",
    glowAlpha: 0.44,
    corner: "#ff48b0",
    cornerAlpha: 0.14,
    dark: "#3d5588",
    darkAlpha: 0.16,
  },
  {
    elevation: 5,
    edge: "#d9577f",
    edgeAlpha: 0.2,
    glow: "#ffb511",
    glowAlpha: 0.46,
    corner: "#ff8e91",
    cornerAlpha: 0.14,
    dark: "#3d5588",
    darkAlpha: 0,
  },
  {
    elevation: 18,
    edge: "#2c68b2",
    edgeAlpha: 0.24,
    glow: "#ffd03a",
    glowAlpha: 0.38,
    corner: "#d9577f",
    cornerAlpha: 0.14,
    dark: "#3d5588",
    darkAlpha: 0,
  },
  {
    elevation: 50,
    edge: "#5ec8e5",
    edgeAlpha: 0.2,
    glow: "#ffe800",
    glowAlpha: 0.3,
    corner: "#ffb511",
    cornerAlpha: 0.12,
    dark: "#3d5588",
    darkAlpha: 0,
  },
] as const satisfies LightKey[];

const CLOUD_INK = "#5d6688";

/** Return the paper's ink washes for a sun `sunElevation` degrees above the horizon, eased between dawn, day, dusk and night keys, and greyed under rain or snow. */
export function getSkyLight(options: {
  sunElevation: number;
  weather: Weather;
}): SkyLight {
  const elevation = clamp(
    options.sunElevation,
    KEYS[0].elevation,
    KEYS[KEYS.length - 1].elevation
  );
  const upper = Math.max(
    1,
    KEYS.findIndex((key) => key.elevation >= elevation)
  );
  const from = KEYS[upper - 1];
  const to = KEYS[upper];
  const amount = smoothstep(from.elevation, to.elevation, elevation);
  const mix = (key: "edge" | "glow" | "corner" | "dark") =>
    mixHex({ from: from[key], to: to[key], amount });
  const between = (
    key: "edgeAlpha" | "glowAlpha" | "cornerAlpha" | "darkAlpha"
  ) => from[key] + (to[key] - from[key]) * amount;
  const cloud = options.weather === "clear" ? 0 : 1;
  return {
    edge: mixHex({ from: mix("edge"), to: CLOUD_INK, amount: 0.5 * cloud }),
    edgeAlpha: between("edgeAlpha") + 0.06 * cloud,
    glow: mix("glow"),
    glowAlpha: between("glowAlpha") * (1 - 0.55 * cloud),
    corner: mix("corner"),
    cornerAlpha: between("cornerAlpha"),
    dark: mix("dark"),
    darkAlpha: between("darkAlpha"),
  };
}
