import type { ToySnapshot } from "@/lib/paws/wire-types";

import { lerp } from "./lerp";
import { lerpAngle } from "./lerp-angle";

/** Return the toy a fraction `t` of the way from snapshot `from` to `to`: its place eased between them, everything else as in `to`. */
export function interpolateToySnapshot(options: {
  from: ToySnapshot;
  to: ToySnapshot;
  t: number;
}): ToySnapshot {
  const { from, to, t } = options;
  return {
    ...to,
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    h: lerp(from.h, to.h, t),
    angle: lerpAngle(from.angle, to.angle, t),
    spin: lerp(from.spin, to.spin, t),
  };
}
