import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import type { WorldView } from "./render-types";

/** Return the view that fits the world's height inside a `width` by `height` CSS pixel viewport: centered when the whole width fits, otherwise around world x `centerX` without showing past the world's left or right edge. */
export function getWorldView(options: {
  width: number;
  height: number;
  centerX: number;
}): WorldView {
  const scale = options.height / ROOM_LIMITS.worldHeight;
  const worldWidthPx = ROOM_LIMITS.worldWidth * scale;
  const offsetX =
    worldWidthPx <= options.width
      ? (options.width - worldWidthPx) / 2
      : Math.min(
          0,
          Math.max(
            options.width - worldWidthPx,
            options.width / 2 - options.centerX * scale
          )
        );
  return { scale, offsetX, offsetY: 0 };
}
