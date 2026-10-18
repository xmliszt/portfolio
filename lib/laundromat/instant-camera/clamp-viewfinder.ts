import clamp from "lodash/clamp.js";

import type { ViewfinderFrame, ViewportSize } from "./viewfinder-frame";

/** Return `frame` moved the least distance that keeps it inside `viewport`, without changing its size. */
export function clampViewfinder(options: {
  frame: ViewfinderFrame;
  viewport: ViewportSize;
}): ViewfinderFrame {
  const { frame, viewport } = options;
  return {
    ...frame,
    x: clamp(frame.x, 0, Math.max(0, viewport.width - frame.width)),
    y: clamp(frame.y, 0, Math.max(0, viewport.height - frame.height)),
  };
}
