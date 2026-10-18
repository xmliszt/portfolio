import { clampViewfinder } from "./clamp-viewfinder";
import { sizeViewfinder } from "./size-viewfinder";
import type {
  ViewfinderCorner,
  ViewfinderFrame,
  ViewfinderOrientation,
  ViewportSize,
} from "./viewfinder-frame";
import { VIEWFINDER_RATIO } from "./viewfinder-frame";

/** Return `start` resized by dragging `corner` by `dx`, `dy`, following whichever axis moves the frame more, keeping the ratio and the opposite corner in place, then pushed back inside `viewport` when it grows past an edge. */
export function resizeViewfinder(options: {
  start: ViewfinderFrame;
  corner: ViewfinderCorner;
  dx: number;
  dy: number;
  orientation: ViewfinderOrientation;
  viewport: ViewportSize;
  minShortPx: number;
}) {
  const { start, corner } = options;
  const signX = corner.endsWith("right") ? 1 : -1;
  const signY = corner.startsWith("bottom") ? 1 : -1;
  const anchorX = signX > 0 ? start.x : start.x + start.width;
  const anchorY = signY > 0 ? start.y : start.y + start.height;
  const widthFromX = start.width + signX * options.dx;
  const widthFromY =
    (start.height + signY * options.dy) * VIEWFINDER_RATIO[options.orientation];
  const size = sizeViewfinder({
    orientation: options.orientation,
    width:
      Math.abs(widthFromX - start.width) >= Math.abs(widthFromY - start.width)
        ? widthFromX
        : widthFromY,
    viewport: options.viewport,
    minShortPx: options.minShortPx,
  });
  return clampViewfinder({
    frame: {
      x: signX > 0 ? anchorX : anchorX - size.width,
      y: signY > 0 ? anchorY : anchorY - size.height,
      ...size,
    },
    viewport: options.viewport,
  });
}
