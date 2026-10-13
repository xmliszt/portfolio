import type { TimeOfDay } from "./get-time-of-day";
import type { SceneConfig } from "./scene-config";

const MOON_STRENGTH = 0.35;
const MOON_FADE_HOURS = 3;

function smoothstep(value: number) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

/** Return the moonlight outside: its `color`, its `strength` (0 while the sun is up, rising from 0 over `MOON_FADE_HOURS` after sunset and falling back to 0 by sunrise), and where the moon is along its `arc` (`progress` 0–1 across the night sky, `elevation` 0–1). */
export function getMoonLight(options: {
  timeOfDay: TimeOfDay;
  sky: SceneConfig["sky"];
}) {
  const { timeOfDay, sky } = options;
  const nightHours = 24 - (sky.sunsetHour - sky.sunriseHour);
  const hoursSinceSunset = (((timeOfDay.hour - sky.sunsetHour) % 24) + 24) % 24;
  const progress = Math.min(hoursSinceSunset / nightHours, 1);
  const moonUp = Math.min(
    smoothstep(hoursSinceSunset / MOON_FADE_HOURS),
    smoothstep((nightHours - hoursSinceSunset) / MOON_FADE_HOURS)
  );
  return {
    color: sky.moonColor,
    strength:
      timeOfDay.sun === undefined
        ? MOON_STRENGTH * timeOfDay.nightOpacity * moonUp
        : 0,
    arc: { progress, elevation: Math.sin(Math.PI * progress) },
  };
}
