import type { Vec4 } from "@/lib/paws/sim/cat-poses";
import type { DerivedCat, DerivedLeg } from "@/lib/paws/sim/derive-cat";
import { getBoxGap } from "@/lib/paws/sim/get-box-gap";
import { smoothstep } from "@/lib/paws/sim/smoothstep";
import { TOY_LIMITS } from "@/lib/paws/sim/toy-limits";
import type { ToySnapshot } from "@/lib/paws/wire-types";

const STRADDLE = 40;
const DRAPE = 45;

/** Return a copy of `cat` raised where it meets the walls of `box`: the whole cat while its middle is near a wall, and, once its middle is inside, each part outside the box by less the farther it hangs from the wall; a cat away from the box comes back unchanged. */
export function liftCatOverBox(options: {
  cat: DerivedCat;
  box: ToySnapshot;
}): DerivedCat {
  const { cat, box } = options;
  const wall = TOY_LIMITS.box.height;
  const middleGap = getBoxGap({ box, x: cat.x, y: cat.y });
  if (middleGap > STRADDLE) return cat;
  const bodyLift = wall * (1 - smoothstep(0, STRADDLE, Math.abs(middleGap)));
  const liftAt = (x: number, y: number, h: number) => {
    const gap = getBoxGap({ box, x, y });
    const drape = gap > 0 ? wall * (1 - smoothstep(0, DRAPE, gap)) : 0;
    return Math.max(h + bodyLift, drape);
  };
  const raise = (point: Vec4): Vec4 => [
    point[0],
    point[1],
    point[2],
    liftAt(point[0], point[1], point[3]),
  ];
  const raiseLeg = (leg: DerivedLeg): DerivedLeg => ({
    ...leg,
    h: liftAt(leg.x, leg.y, leg.h),
    attach: [
      leg.attach[0],
      leg.attach[1],
      liftAt(leg.attach[0], leg.attach[1], leg.attach[2]),
    ],
    hock: leg.hock === undefined ? undefined : raise(leg.hock),
  });
  const [a, b, c, d] = cat.legs;
  const tailBase = cat.tail.at(0) ?? [cat.x, cat.y];
  return {
    ...cat,
    spine: cat.spine.map(raise),
    head: raise(cat.head),
    headH: liftAt(cat.head[0], cat.head[1], cat.headH),
    thighs: [raise(cat.thighs[0]), raise(cat.thighs[1])],
    legs: [raiseLeg(a), raiseLeg(b), raiseLeg(c), raiseLeg(d)],
    tailHeights: {
      base: liftAt(tailBase[0], tailBase[1], cat.tailHeights.base),
      tip: liftAt(cat.tailTip.x, cat.tailTip.y, cat.tailHeights.tip),
    },
  };
}
