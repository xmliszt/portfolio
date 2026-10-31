import type { LegSnapshot } from "@/lib/paws/wire-types";

import type { SimLeg } from "./sim-types";

/** Return the position and height of `leg` as screens receive it. */
export function toLegSnapshot(leg: SimLeg): LegSnapshot {
  return { x: leg.x, y: leg.y, h: leg.h };
}
