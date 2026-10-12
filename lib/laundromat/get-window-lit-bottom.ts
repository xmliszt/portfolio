import type { SceneConfig } from "./scene-config";

/** Return the lowest height on a window spanning `bottom`–`top` that the light along `shadow` reaches over the building across the street, or `undefined` when that building shades the whole window. */
export function getWindowLitBottom(options: {
  bottom: number;
  top: number;
  shadow: { x: number; y: number };
  street: SceneConfig["street"];
}) {
  const { street } = options;
  const shadeTop =
    street.oppositeHeight - street.oppositeDistance / options.shadow.x;
  const litBottom = Math.max(options.bottom, shadeTop);
  return litBottom < options.top ? litBottom : undefined;
}
