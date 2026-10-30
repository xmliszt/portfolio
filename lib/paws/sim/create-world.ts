import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import type { World } from "./sim-types";

/** Return an empty room of glass, `ROOM_LIMITS.worldWidth` by `worldHeight` units, that draws its chances from `random`. */
export function createWorld(options: { random: () => number }): World {
  return {
    random: options.random,
    time: 0,
    width: ROOM_LIMITS.worldWidth,
    height: ROOM_LIMITS.worldHeight,
    cats: {},
    fingers: {},
  };
}
