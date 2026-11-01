import type { SimToy, World } from "./sim-types";

const BOX_COUNT = 2;
const BOWL_COUNT = 3;
const EDGE = 140;
const MIN_GAP = 320;
const TRIES = 40;

const still = { h: 0, angle: 0, spin: 0, vx: 0, vy: 0, vh: 0 };

/** Return the toys every room starts with, two cardboard boxes and three full water bowls, at random spots from `random` inside `world`'s edges and, where the tries allow, `MIN_GAP` apart. */
export function createToys(options: {
  random: () => number;
  world: Pick<World, "width" | "height">;
}): SimToy[] {
  const { random, world } = options;
  const spots: { x: number; y: number }[] = [];
  const pickSpot = () => {
    const tries = Array.from({ length: TRIES }, () => ({
      x: EDGE + random() * (world.width - 2 * EDGE),
      y: EDGE + random() * (world.height - 2 * EDGE),
    }));
    const clearance = (spot: { x: number; y: number }) =>
      Math.min(
        Infinity,
        ...spots.map((other) => Math.hypot(other.x - spot.x, other.y - spot.y))
      );
    const spot =
      tries.find((candidate) => clearance(candidate) >= MIN_GAP) ??
      tries.reduce((best, candidate) =>
        clearance(candidate) > clearance(best) ? candidate : best
      );
    spots.push(spot);
    return spot;
  };
  const boxes = Array.from({ length: BOX_COUNT }, (_, i) => ({
    ...still,
    ...pickSpot(),
    kind: "box" as const,
    id: `box-${i + 1}`,
    angle: (random() - 0.5) * 0.6,
  }));
  const bowls = Array.from({ length: BOWL_COUNT }, (_, i) => ({
    ...still,
    ...pickSpot(),
    kind: "bowl" as const,
    id: `bowl-${i + 1}`,
    spill: undefined,
  }));
  return [...boxes, ...bowls] satisfies SimToy[];
}
