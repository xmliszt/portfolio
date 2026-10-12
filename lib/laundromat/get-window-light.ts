import { getStreetLight } from "./get-street-light";
import type { TimeOfDay } from "./get-time-of-day";
import { getWindowLitBottom } from "./get-window-lit-bottom";
import type { SceneConfig, SceneObject } from "./scene-config";

const MOON_PATCH_OPACITY = 0.5;

export type WindowLight = NonNullable<ReturnType<typeof getWindowLight>>;

/** Return the light coming through the left-wall `window`: the lit part of its `opening`, the floor offset `shadow` per unit of height, and the `color` and `opacity` of the light it casts, or `undefined` when the building across the street shades the whole window. */
export function getWindowLight(options: {
  window: SceneObject;
  timeOfDay: TimeOfDay;
  config: SceneConfig;
}) {
  const { timeOfDay, config } = options;
  const { position, size } = options.window;
  const streetLight = getStreetLight({ timeOfDay, sky: config.sky });
  const top = position.z + size.h;
  const bottom = getWindowLitBottom({
    bottom: position.z,
    top,
    shadow: streetLight.shadow,
    street: config.street,
  });
  if (bottom === undefined) return undefined;
  const isNight = timeOfDay.sun === undefined;
  return {
    opening: {
      wallX: position.x,
      fromY: position.y,
      toY: position.y + size.d,
      bottom,
      top,
    },
    shadow: streetLight.shadow,
    color: isNight ? config.sky.moonColor : timeOfDay.daylightPatchColor,
    opacity: isNight
      ? streetLight.strength * MOON_PATCH_OPACITY
      : timeOfDay.daylightPatchOpacity,
  };
}
