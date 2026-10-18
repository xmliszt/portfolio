import { clampViewfinder } from "./clamp-viewfinder";
import { sizeViewfinder } from "./size-viewfinder";
import type {
  ViewfinderFrame,
  ViewfinderOrientation,
  ViewportSize,
} from "./viewfinder-frame";

/** Return `frame` grown or shrunk by `factor` around its centre, within the size limits of `sizeViewfinder` and inside `viewport`. */
export function scaleViewfinder(options: {
  frame: ViewfinderFrame;
  factor: number;
  orientation: ViewfinderOrientation;
  viewport: ViewportSize;
  minShortPx: number;
}) {
  const { frame } = options;
  const size = sizeViewfinder({
    orientation: options.orientation,
    width: frame.width * options.factor,
    viewport: options.viewport,
    minShortPx: options.minShortPx,
  });
  return clampViewfinder({
    frame: {
      x: frame.x + frame.width / 2 - size.width / 2,
      y: frame.y + frame.height / 2 - size.height / 2,
      ...size,
    },
    viewport: options.viewport,
  });
}
