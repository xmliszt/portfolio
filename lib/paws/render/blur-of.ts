/** Return the blur radius in world units for something `h` units above the glass on a cat drawn at scale `k`. */
export function blurOf(h: number, k: number) {
  return (0.5 + 8 * Math.log1p(Math.max(0, h) / 14)) * k;
}
