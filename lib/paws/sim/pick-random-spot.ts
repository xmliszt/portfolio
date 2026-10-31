import { isCatOnstage } from "./is-cat-onstage";
import type { Point, SimCat, World } from "./sim-types";

/** Return a random spot on the glass for `cat`, the best of a few tries at keeping clear of other cats. */
export function pickRandomSpot(options: { world: World; cat: SimCat }): Point {
  const { world, cat } = options;
  const others = Object.values(world.cats).filter(
    (other) => other !== cat && isCatOnstage(other)
  );
  const tries = Array.from({ length: 8 }, () => ({
    x: world.width * (0.12 + world.random() * 0.76),
    y: world.height * (0.15 + world.random() * 0.7),
  }));
  const clearance = (spot: Point) =>
    Math.min(
      Infinity,
      ...others.map((other) =>
        Math.min(
          Math.hypot(other.x - spot.x, other.y - spot.y),
          Math.hypot(other.wander.x - spot.x, other.wander.y - spot.y)
        )
      )
    );
  return tries.reduce((best, spot) =>
    clearance(spot) > clearance(best) ? spot : best
  );
}
