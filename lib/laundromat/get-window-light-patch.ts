import type { SceneConfig } from "./scene-config";

/** Return the floor corners (iso `x`, `y`) of the light falling through a left-wall window along `shadow` (the floor offset per unit of height), lit bottom edge first and clamped to the `floor`, or `undefined` when the building across the street shades the whole window. */
export function getWindowLightPatch(options: {
  wallX: number;
  fromY: number;
  toY: number;
  bottom: number;
  top: number;
  shadow: { x: number; y: number };
  street: SceneConfig["street"];
  floor: { width: number; depth: number };
}) {
  const { shadow, street } = options;
  const shadeTop = street.oppositeHeight - street.oppositeDistance / shadow.x;
  const litBottom = Math.max(options.bottom, shadeTop);
  if (litBottom >= options.top) return undefined;
  function onFloor(y: number, z: number) {
    return {
      x: Math.min(options.floor.width, options.wallX + shadow.x * z),
      y: Math.min(options.floor.depth, Math.max(0, y + shadow.y * z)),
    };
  }
  return [
    onFloor(options.fromY, litBottom),
    onFloor(options.toY, litBottom),
    onFloor(options.toY, options.top),
    onFloor(options.fromY, options.top),
  ];
}
