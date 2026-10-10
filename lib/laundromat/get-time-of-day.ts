import { mixHexColors } from "./mix-hex-colors";
import type { SceneConfig } from "./scene-config";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function getSky(options: { hour: number; sky: SceneConfig["sky"] }) {
  const { keys } = options.sky;
  const wrapped = [...keys, { ...keys[0], hour: keys[0].hour + 24 }];
  const nextIndex = wrapped.findIndex((key) => key.hour > options.hour);
  const from = wrapped[nextIndex - 1];
  const to = wrapped[nextIndex];
  const amount = smoothstep((options.hour - from.hour) / (to.hour - from.hour));
  return {
    skyTop: mixHexColors({ from: from.top, to: to.top, amount }),
    skyHorizon: mixHexColors({ from: from.horizon, to: to.horizon, amount }),
  };
}

export type TimeOfDay = ReturnType<typeof getTimeOfDay>;

/** Return the sky colours, sun, night and lamp levels of the room at fractional `hour` (0–24, wrapped). */
export function getTimeOfDay(options: { hour: number; config: SceneConfig }) {
  const { sky, light } = options.config;
  const hour = ((options.hour % 24) + 24) % 24;
  const daylight = Math.min(
    smoothstep((hour - sky.sunriseHour) / sky.twilightHours),
    smoothstep((sky.sunsetHour - hour) / sky.twilightHours)
  );
  const isSunUp = hour >= sky.sunriseHour && hour <= sky.sunsetHour;
  const sunProgress =
    (hour - sky.sunriseHour) / (sky.sunsetHour - sky.sunriseHour);
  const sunElevation = isSunUp ? Math.sin(Math.PI * sunProgress) : 0;
  return {
    hour,
    ...getSky({ hour, sky }),
    daylight,
    nightOpacity: 1 - daylight,
    sun: isSunUp
      ? {
          progress: sunProgress,
          elevation: sunElevation,
          color: mixHexColors({
            from: sky.sunWarmColor,
            to: sky.sunColor,
            amount: smoothstep(sunElevation * 2),
          }),
        }
      : undefined,
    lampIntensity:
      light.poolIntensity * (1 - (1 - light.lampNoonRatio) * sunElevation),
    daylightPatchOpacity: light.daylightPatchStrength * daylight,
  };
}
