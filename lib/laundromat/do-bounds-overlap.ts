import type { ScreenBounds } from "./build-scene-layout";

/** Return `true` if screen rectangles `a` and `b` share any area; `false` when they only touch or are apart. */
export function doBoundsOverlap(a: ScreenBounds, b: ScreenBounds) {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}
