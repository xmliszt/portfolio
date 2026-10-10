import type { ScreenBounds } from "./build-scene-layout";
import type { ScreenPoint } from "./project-iso-point";

/** Return a CSS `clip-path` tracing `outline`, relative to the top-left of `bounds`. */
export function toClipPath(options: {
  outline: ScreenPoint[];
  bounds: ScreenBounds;
}) {
  const { outline, bounds } = options;
  return `polygon(${outline
    .map((point) => `${point.x - bounds.x}px ${point.y - bounds.y}px`)
    .join(", ")})`;
}
