import type { Vec2 } from "./cat-poses";

export type CatFrame = { x: number; y: number; heading: number; scale: number };

/** Return the world position of the cat-local point `local` on a cat at `frame`. */
export function catToWorld(
  frame: CatFrame,
  local: readonly [number, number]
): Vec2 {
  const cos = Math.cos(frame.heading);
  const sin = Math.sin(frame.heading);
  return [
    frame.x + (local[0] * cos - local[1] * sin) * frame.scale,
    frame.y + (local[0] * sin + local[1] * cos) * frame.scale,
  ];
}
