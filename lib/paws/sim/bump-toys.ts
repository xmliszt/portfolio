import { getToyFingerId } from "./get-toy-finger-id";
import { getToyRadius } from "./get-toy-radius";
import { isToyUsedUp } from "./is-toy-used-up";
import type { SimCat, SimToy } from "./sim-types";
import { TOY_LIMITS } from "./toy-limits";

const PAW_RADIUS = 6.5;
const MIN_PUSH_SPEED = 30;
const TOPPLE_SPEED = 60;

const toyHeight = (toy: SimToy) => {
  switch (toy.kind) {
    case "yarn":
      return getToyRadius(toy) * 2;
    case "roll":
      return toy.isStanding
        ? TOY_LIMITS.roll.halfLength * 2
        : TOY_LIMITS.radius.roll * 2;
    case "bowl":
      return TOY_LIMITS.bowl.depth;
    case "box":
      return TOY_LIMITS.box.height;
    default: {
      const unknown: never = toy;
      return unknown;
    }
  }
};

/** Push each toy on the glass in `toys` out of the paws of `cats` that walk into it, at least as fast as the cat walks, and out from under the body of a cat sitting or lying on it; a standing roll hit at `TOPPLE_SPEED` or more falls over, and the box, used-up toys and paws reaching for a toy on purpose push nothing. */
export function bumpToys(options: { toys: SimToy[]; cats: SimCat[] }) {
  for (const toy of options.toys) {
    if (toy.kind === "box" || toy.h > 0 || isToyUsedUp(toy)) continue;
    const fingerId = getToyFingerId(toy.id);
    const radius = getToyRadius(toy);
    const height = toyHeight(toy);
    for (const cat of options.cats) {
      const paws = cat.legs
        .filter(
          (leg) =>
            leg.h < height &&
            !(
              leg.reach?.target.kind === "finger" &&
              leg.reach.target.userId === fingerId
            )
        )
        .map((leg) => ({
          x: leg.x,
          y: leg.y,
          r: PAW_RADIUS * cat.build.scale,
        }));
      const isResting = cat.weights.stand < 0.5;
      const body = isResting
        ? cat.derived.spine.map(([x, y, r]) => ({ x, y, r }))
        : [];
      for (const part of [...paws, ...body]) {
        const dx = toy.x - part.x;
        const dy = toy.y - part.y;
        const gap = Math.hypot(dx, dy);
        const overlap = radius + part.r - gap;
        if (overlap <= 0) continue;
        const nx = gap > 0.001 ? dx / gap : Math.cos(cat.heading);
        const ny = gap > 0.001 ? dy / gap : Math.sin(cat.heading);
        toy.x += nx * overlap;
        toy.y += ny * overlap;
        if (isResting) continue;
        const speed = Math.max(MIN_PUSH_SPEED, cat.speed);
        const along = toy.vx * nx + toy.vy * ny;
        if (along < speed) {
          toy.vx += nx * (speed - along);
          toy.vy += ny * (speed - along);
        }
        if (
          toy.kind === "roll" &&
          toy.isStanding &&
          cat.speed >= TOPPLE_SPEED
        ) {
          toy.isStanding = false;
          toy.angle = Math.atan2(ny, nx) + Math.PI / 2;
        }
      }
    }
  }
}
