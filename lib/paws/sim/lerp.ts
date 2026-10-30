/** Return the point a fraction `t` of the way from `a` to `b`. */
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
