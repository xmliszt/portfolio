import type { Vec4 } from "@/lib/paws/sim/cat-poses";
import type { DerivedCat, DerivedLeg } from "@/lib/paws/sim/derive-cat";

/** Return a copy of `cat` with every height above the glass multiplied by `factor`, leaving where each part lies unchanged. */
export function flattenCat(options: {
  cat: DerivedCat;
  factor: number;
}): DerivedCat {
  const { cat, factor } = options;
  const lower = (point: Vec4): Vec4 => [
    point[0],
    point[1],
    point[2],
    point[3] * factor,
  ];
  const lowerLeg = (leg: DerivedLeg): DerivedLeg => ({
    ...leg,
    h: leg.h * factor,
    attach: [leg.attach[0], leg.attach[1], leg.attach[2] * factor],
    hock: leg.hock === undefined ? undefined : lower(leg.hock),
  });
  const [a, b, c, d] = cat.legs;
  return {
    ...cat,
    spine: cat.spine.map(lower),
    head: lower(cat.head),
    headH: cat.headH * factor,
    thighs: [lower(cat.thighs[0]), lower(cat.thighs[1])],
    legs: [lowerLeg(a), lowerLeg(b), lowerLeg(c), lowerLeg(d)],
    tailHeights: {
      base: cat.tailHeights.base * factor,
      tip: cat.tailHeights.tip * factor,
    },
  };
}
