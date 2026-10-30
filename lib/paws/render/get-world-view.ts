import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import type { WorldView } from "./render-types";

/** Return the view that fits the whole world inside a `width` by `height` CSS pixel viewport, centered. */
export function getWorldView(options: {
  width: number;
  height: number;
}): WorldView {
  const scale = Math.min(
    options.width / ROOM_LIMITS.worldWidth,
    options.height / ROOM_LIMITS.worldHeight
  );
  return {
    scale,
    offsetX: (options.width - ROOM_LIMITS.worldWidth * scale) / 2,
    offsetY: (options.height - ROOM_LIMITS.worldHeight * scale) / 2,
  };
}
