import type { WindowLight } from "./get-window-lights";

/** Return the floor corners (iso `x`, `y`) of the light falling through a left-wall window `opening` along `shadow` (the floor offset per unit of height), lit bottom edge first and clamped to the `floor`. */
export function getWindowLightPatch(options: {
  opening: WindowLight["opening"];
  shadow: WindowLight["shadow"];
  floor: { width: number; depth: number };
}) {
  const { opening, shadow } = options;
  function onFloor(y: number, z: number) {
    return {
      x: Math.min(options.floor.width, opening.wallX + shadow.x * z),
      y: Math.min(options.floor.depth, Math.max(0, y + shadow.y * z)),
    };
  }
  return [
    onFloor(opening.fromY, opening.bottom),
    onFloor(opening.toY, opening.bottom),
    onFloor(opening.toY, opening.top),
    onFloor(opening.fromY, opening.top),
  ];
}
