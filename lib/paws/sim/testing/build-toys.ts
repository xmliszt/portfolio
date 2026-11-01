import type { SimToy } from "@/lib/paws/sim/sim-types";

const still = { h: 0, angle: 0, spin: 0, vx: 0, vy: 0, vh: 0 };

/** Return a fixed set of one of each toy for tests: a full yarn ball, a standing toilet roll, a full water bowl and a cardboard box, each more than `PAW_RANGE` from the others. */
export function buildToys(): SimToy[] {
  return [
    { ...still, kind: "yarn", id: "yarn-1", x: 420, y: 720, left: 1, fade: 0 },
    {
      ...still,
      kind: "roll",
      id: "roll-1",
      x: 1180,
      y: 290,
      isStanding: true,
      unrolled: 0,
      fade: 0,
    },
    { ...still, kind: "bowl", id: "bowl-1", x: 1270, y: 770, spill: undefined },
    { ...still, kind: "box", id: "box-1", x: 520, y: 270, angle: 0.08 },
  ];
}
