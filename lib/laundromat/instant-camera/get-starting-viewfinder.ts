import { clampViewfinder } from "./clamp-viewfinder";
import { INSTANT_CAMERA } from "./instant-camera-config";
import { sizeViewfinder } from "./size-viewfinder";
import type { ViewfinderOrientation, ViewportSize } from "./viewfinder-frame";
import { VIEWFINDER_RATIO } from "./viewfinder-frame";

/** Return the frame the viewfinder opens at: centred in `viewport`, `INSTANT_CAMERA.startHeightRatio` of its height tall. */
export function getStartingViewfinder(options: {
  orientation: ViewfinderOrientation;
  viewport: ViewportSize;
  minShortPx: number;
}) {
  const { viewport } = options;
  const size = sizeViewfinder({
    orientation: options.orientation,
    width:
      viewport.height *
      INSTANT_CAMERA.startHeightRatio *
      VIEWFINDER_RATIO[options.orientation],
    viewport,
    minShortPx: options.minShortPx,
  });
  return clampViewfinder({
    frame: {
      x: (viewport.width - size.width) / 2,
      y: (viewport.height - size.height) / 2,
      ...size,
    },
    viewport,
  });
}
