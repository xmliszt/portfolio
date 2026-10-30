import { clamp } from "./clamp";

/** Return 0 below `edge0`, 1 above `edge1`, and an eased ramp between them. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
