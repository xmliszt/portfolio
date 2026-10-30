import { wrapAngle } from "./wrap-angle";

/** Return the angle a fraction `t` of the way from `a` to `b` in radians, turning the short way round. */
export function lerpAngle(a: number, b: number, t: number) {
  return a + wrapAngle(b - a) * t;
}
