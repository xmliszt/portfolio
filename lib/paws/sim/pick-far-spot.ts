import type { Point, SimCat, World } from "./sim-types";

/** Return the spot on the glass farthest from `cat` among a few random tries. */
export function pickFarSpot(options: { world: World; cat: SimCat }): Point {
  const { world, cat } = options;
  return Array.from({ length: 5 }, () => ({
    x: world.width * (0.1 + world.random() * 0.8),
    y: world.height * (0.15 + world.random() * 0.7),
  })).reduce((best, spot) =>
    Math.hypot(spot.x - cat.x, spot.y - cat.y) >
    Math.hypot(best.x - cat.x, best.y - cat.y)
      ? spot
      : best
  );
}
