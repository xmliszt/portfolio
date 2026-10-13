import { getStreetLights } from "./get-street-lights";
import type { TimeOfDay } from "./get-time-of-day";
import { getWindowLitBottom } from "./get-window-lit-bottom";
import type { SceneConfig, SceneObject } from "./scene-config";

const MOON_PATCH_OPACITY = 0.5;

export type WindowLight = ReturnType<typeof getWindowLights>[number];

/** Return the sun's and the moon's light coming through the left-wall `window`, each with the lit part of its `opening`, the floor offset `shadow` per unit of height, and the `color` and `opacity` of the light it casts, leaving out a light whose whole window the building across the street shades. */
export function getWindowLights(options: {
  window: SceneObject;
  timeOfDay: TimeOfDay;
  config: SceneConfig;
}) {
  const { timeOfDay, config } = options;
  const { position, size } = options.window;
  const top = position.z + size.h;
  return getStreetLights({ timeOfDay, sky: config.sky }).flatMap((light) => {
    const bottom = getWindowLitBottom({
      bottom: position.z,
      top,
      shadow: light.shadow,
      street: config.street,
    });
    if (bottom === undefined) return [];
    const isSun = light.key === "sun";
    return [
      {
        key: light.key,
        opening: {
          wallX: position.x,
          fromY: position.y,
          toY: position.y + size.d,
          bottom,
          top,
        },
        shadow: light.shadow,
        color: isSun ? timeOfDay.daylightPatchColor : light.color,
        opacity: isSun
          ? timeOfDay.daylightPatchOpacity
          : light.strength * MOON_PATCH_OPACITY,
      },
    ];
  });
}
