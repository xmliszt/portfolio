import { getBoxGap } from "./get-box-gap";
import { isCatOnstage } from "./is-cat-onstage";
import type { Point, SimCat, World } from "./sim-types";

const BOX_SPOT_CLEARANCE = 150;

/** Return a random spot on the glass for `cat`, away from every box when one of a few tries is, and the best of those at keeping clear of other cats. */
export function pickRandomSpot(options: { world: World; cat: SimCat }): Point {
  const { world, cat } = options;
  const others = Object.values(world.cats).filter(
    (other) => other !== cat && isCatOnstage(other)
  );
  const boxes = world.toys.filter((toy) => toy.kind === "box");
  const tries = Array.from({ length: 8 }, () => ({
    x: world.width * (0.12 + world.random() * 0.76),
    y: world.height * (0.15 + world.random() * 0.7),
  }));
  const clearOfBox = tries.filter((spot) =>
    boxes.every((box) => getBoxGap({ box, ...spot }) > BOX_SPOT_CLEARANCE)
  );
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
  return (clearOfBox.length > 0 ? clearOfBox : tries).reduce((best, spot) =>
    clearance(spot) > clearance(best) ? spot : best
  );
}
