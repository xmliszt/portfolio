import type { Vec2 } from "./cat-poses";
import type { CatFrame } from "./cat-to-world";

/** Return the cat-local position of the world point `x, y` on a cat at `frame`. */
export function worldToCat(
  frame: CatFrame,
  point: { x: number; y: number }
): Vec2 {
  const dx = (point.x - frame.x) / frame.scale;
  const dy = (point.y - frame.y) / frame.scale;
  const cos = Math.cos(frame.heading);
  const sin = Math.sin(frame.heading);
  return [dx * cos + dy * sin, -dx * sin + dy * cos];
}
