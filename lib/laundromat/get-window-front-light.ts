import type { WindowLight } from "./get-window-light";

/** Return the corners (iso points) of the light from a left-wall window `opening` on the plane `y = frontY`, lit bottom edge first, or `undefined` when the light along `shadow` moves away from that plane. */
export function getWindowFrontLight(options: {
  opening: WindowLight["opening"];
  shadow: WindowLight["shadow"];
  frontY: number;
}) {
  const { opening, shadow, frontY } = options;
  if (shadow.y >= 0) return undefined;
  function onFront(y: number, z: number) {
    const drop = (frontY - y) / shadow.y;
    return { x: opening.wallX + shadow.x * drop, y: frontY, z: z - drop };
  }
  return [
    onFront(opening.fromY, opening.bottom),
    onFront(opening.toY, opening.bottom),
    onFront(opening.toY, opening.top),
    onFront(opening.fromY, opening.top),
  ];
}
