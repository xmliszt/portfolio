import { getMoonLight } from "./get-moon-light";
import type { TimeOfDay } from "./get-time-of-day";
import type { SceneConfig } from "./scene-config";

const MAX_ELEVATION_RAD = (62 * Math.PI) / 180;
const MIN_ELEVATION_RAD = (7 * Math.PI) / 180;
const MAX_SLANT = 0.9;

export type StreetLight = ReturnType<typeof getStreetLights>[number];

function toShadow(arc: { progress: number; elevation: number }) {
  const elevationRad = Math.max(
    MIN_ELEVATION_RAD,
    arc.elevation * MAX_ELEVATION_RAD
  );
  const perHeight = 1 / Math.tan(elevationRad);
  return {
    x: perHeight,
    y: (arc.progress - 0.5) * 2 * MAX_SLANT * perHeight,
  };
}

/** Return the two lights on the street outside the left-wall window, the sun and the moon, each with its `color`, `strength` (0–1) and the floor offset (`shadow`, iso `x` and `y`) of the shadow cast by a point one unit high. While the sun is down it keeps the position where it set or will rise, at `strength` 0. */
export function getStreetLights(options: {
  timeOfDay: TimeOfDay;
  sky: SceneConfig["sky"];
}) {
  const { timeOfDay, sky } = options;
  const moon = getMoonLight({ timeOfDay, sky });
  const sunArc = timeOfDay.sun ?? {
    progress: timeOfDay.hour < 12 ? 0 : 1,
    elevation: 0,
  };
  return [
    {
      key: "sun",
      color: timeOfDay.sun?.color ?? sky.sunWarmColor,
      strength: timeOfDay.daylight,
      shadow: toShadow(sunArc),
    },
    {
      key: "moon",
      color: moon.color,
      strength: moon.strength,
      shadow: toShadow(moon.arc),
    },
  ] satisfies {
    key: "sun" | "moon";
    color: string;
    strength: number;
    shadow: { x: number; y: number };
  }[];
}
