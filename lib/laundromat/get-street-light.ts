import type { TimeOfDay } from "./get-time-of-day";
import type { SceneConfig } from "./scene-config";

const MAX_ELEVATION_RAD = (62 * Math.PI) / 180;
const MIN_ELEVATION_RAD = (7 * Math.PI) / 180;
const MAX_SLANT = 0.9;
const MOON_STRENGTH = 0.35;

/** Return the light on the street outside the left-wall window, the sun by day and the moon by night: its `color`, `strength` (0–1) and the floor offset (`shadow`, iso `x` and `y`) of the shadow cast by a point one unit high. */
export function getStreetLight(options: {
  timeOfDay: TimeOfDay;
  sky: SceneConfig["sky"];
}) {
  const { timeOfDay, sky } = options;
  const source = (() => {
    if (timeOfDay.sun !== undefined) {
      return {
        color: timeOfDay.sun.color,
        strength: timeOfDay.daylight,
        progress: timeOfDay.sun.progress,
        elevation: timeOfDay.sun.elevation,
      };
    }
    const nightHours = 24 - (sky.sunsetHour - sky.sunriseHour);
    const hoursSinceSunset =
      (((timeOfDay.hour - sky.sunsetHour) % 24) + 24) % 24;
    const progress = hoursSinceSunset / nightHours;
    return {
      color: sky.moonColor,
      strength: MOON_STRENGTH * timeOfDay.nightOpacity,
      progress,
      elevation: Math.sin(Math.PI * progress),
    };
  })();
  const elevationRad = Math.max(
    MIN_ELEVATION_RAD,
    source.elevation * MAX_ELEVATION_RAD
  );
  const perHeight = 1 / Math.tan(elevationRad);
  return {
    color: source.color,
    strength: source.strength,
    shadow: {
      x: perHeight,
      y: (source.progress - 0.5) * 2 * MAX_SLANT * perHeight,
    },
  };
}
