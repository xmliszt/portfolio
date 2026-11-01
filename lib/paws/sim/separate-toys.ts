import { getToyGap } from "./get-toy-gap";
import { isToyUsedUp } from "./is-toy-used-up";
import type { SimToy } from "./sim-types";

const AIRBORNE_HEIGHT = 2;

const isHeavy = (toy: SimToy) => toy.kind === "box" || toy.kind === "bowl";

/** Push apart every pair of toys in `toys` that overlap on the glass: a yarn ball or roll moves out of a box or bowl, which stays put, two light toys share the push, and two heavy ones or toys in the air or used up are left alone. */
export function separateToys(toys: SimToy[]) {
  const onGlass = toys.filter(
    (toy) => toy.h <= AIRBORNE_HEIGHT && !isToyUsedUp(toy)
  );
  for (const [index, a] of onGlass.entries()) {
    for (const b of onGlass.slice(index + 1)) {
      if (isHeavy(a) && isHeavy(b)) continue;
      const overlap = -getToyGap({ a, b });
      if (overlap <= 0) continue;
      const gap = Math.hypot(b.x - a.x, b.y - a.y);
      const nx = gap > 0.001 ? (b.x - a.x) / gap : 1;
      const ny = gap > 0.001 ? (b.y - a.y) / gap : 0;
      const shareA = isHeavy(a) ? 0 : isHeavy(b) ? 1 : 0.5;
      a.x -= nx * overlap * shareA;
      a.y -= ny * overlap * shareA;
      b.x += nx * overlap * (1 - shareA);
      b.y += ny * overlap * (1 - shareA);
    }
  }
}
