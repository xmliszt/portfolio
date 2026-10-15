import { getMoonLight } from "@/lib/laundromat/get-moon-light";
import type { TimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { mixHexColors } from "@/lib/laundromat/mix-hex-colors";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

export type BedroomWindowLight = ReturnType<typeof getBedroomWindowLight>;

export type WindowLightSource = BedroomWindowLight["sources"][number];

/** Return the light coming in through the bedroom window, scaled by the `sunlight` share the weather lets through, as two `sources`, the sun and the moon, each with its own `color`, `strength` (0–1) and position in the sky as `sun`, plus their summed `strength` and strength-weighted `color`. Outside its hours a source keeps the position it set at, with `strength` 0. */
export function getBedroomWindowLight(options: {
  timeOfDay: TimeOfDay;
  sky: SceneConfig["sky"];
  sunlight: number;
}) {
  const { timeOfDay } = options;
  const moon = getMoonLight({ timeOfDay, sky: options.sky });
  const sunArc = timeOfDay.sun ?? {
    progress: timeOfDay.hour < 12 ? 0 : 1,
    elevation: 0,
  };
  const sources = [
    {
      key: "sun",
      color: timeOfDay.daylightPatchColor,
      strength: timeOfDay.daylight * options.sunlight,
      sun: {
        progress: sunArc.progress,
        elevation: sunArc.elevation,
        color: timeOfDay.daylightPatchColor,
      },
    },
    {
      key: "moon",
      color: moon.color,
      strength: moon.strength * options.sunlight,
      sun: { ...moon.arc, color: moon.color },
    },
  ] as const;
  const [sun] = sources;
  const strength = sources.reduce((sum, source) => sum + source.strength, 0);
  return {
    sources,
    strength,
    color: mixHexColors({
      from: moon.color,
      to: sun.color,
      amount: strength === 0 ? 0 : sun.strength / strength,
    }),
  };
}
