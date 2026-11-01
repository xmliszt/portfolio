import type { ToySpill } from "@/lib/paws/wire-types";

import { getPuddleRadius } from "./get-puddle-radius";

/** `true` if the point `x`, `y` lies inside the puddle of `spill`; `false` when it is outside or the puddle has dried. */
export function isInPuddle(options: { spill: ToySpill; x: number; y: number }) {
  const { spill, x, y } = options;
  const angle = Math.atan2(y - spill.y, x - spill.x);
  return (
    Math.hypot(x - spill.x, y - spill.y) < getPuddleRadius({ spill, angle })
  );
}
