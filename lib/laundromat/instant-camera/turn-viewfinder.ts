import { clampViewfinder } from "./clamp-viewfinder";
import { sizeViewfinder } from "./size-viewfinder";
import type {
  ViewfinderFrame,
  ViewfinderOrientation,
  ViewportSize,
} from "./viewfinder-frame";
import { VIEWFINDER_RATIO } from "./viewfinder-frame";

/** Return `frame` turned to `orientation` around its centre with about the same area, within the size limits of `sizeViewfinder` and inside `viewport`. */
export function turnViewfinder(options: {
  frame: ViewfinderFrame;
  orientation: ViewfinderOrientation;
  viewport: ViewportSize;
  minShortPx: number;
}) {
  const { frame } = options;
  const size = sizeViewfinder({
    orientation: options.orientation,
    width: Math.sqrt(
      frame.width * frame.height * VIEWFINDER_RATIO[options.orientation]
    ),
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
