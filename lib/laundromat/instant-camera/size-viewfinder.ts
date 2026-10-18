import clamp from "lodash/clamp.js";

import type { ViewfinderOrientation, ViewportSize } from "./viewfinder-frame";
import { VIEWFINDER_RATIO } from "./viewfinder-frame";

/** Return the viewfinder size closest to `width` in `orientation`'s ratio, no shorter than `minShortPx` on its short side and no larger than the biggest frame that fits `viewport`. */
export function sizeViewfinder(options: {
  orientation: ViewfinderOrientation;
  width: number;
  viewport: ViewportSize;
  minShortPx: number;
}) {
  const ratio = VIEWFINDER_RATIO[options.orientation];
  const maxWidth = Math.min(
    options.viewport.width,
    options.viewport.height * ratio
  );
  const minWidth = Math.min(
    maxWidth,
    ratio < 1 ? options.minShortPx : options.minShortPx * ratio
  );
  const width = clamp(options.width, minWidth, maxWidth);
  return { width, height: width / ratio };
}
