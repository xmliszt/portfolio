import type { ToySnapshot } from "@/lib/paws/wire-types";

import { TOY_LIMITS } from "./toy-limits";

/** Return how far the point `x`, `y` lies outside the bottom of `box`, in world units: negative inside, by its distance to the nearest wall. */
export function getBoxGap(options: { box: ToySnapshot; x: number; y: number }) {
  const { box } = options;
  const dx = options.x - box.x;
  const dy = options.y - box.y;
  const u = Math.abs(dx * Math.cos(box.angle) + dy * Math.sin(box.angle));
  const v = Math.abs(-dx * Math.sin(box.angle) + dy * Math.cos(box.angle));
  const outU = u - TOY_LIMITS.box.halfWidth;
  const outV = v - TOY_LIMITS.box.halfDepth;
  if (outU <= 0 && outV <= 0) return Math.max(outU, outV);
  return Math.hypot(Math.max(0, outU), Math.max(0, outV));
}
