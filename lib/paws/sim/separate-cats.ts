import { isCatOnstage } from "./is-cat-onstage";
import type { World } from "./sim-types";

const BODY_RADIUS = 72;

/** Push apart every pair of cats in `world` whose bodies overlap, moving only the walking one when the other is sitting or sleeping, so no cat ever lies on top of another. */
export function separateCats(world: World) {
  const cats = Object.values(world.cats)
    .filter((cat) => isCatOnstage(cat) && cat.state !== "enter")
    .toSorted((a, b) => (a.userId < b.userId ? -1 : 1));
  for (const [index, a] of cats.entries()) {
    for (const b of cats.slice(index + 1)) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const gap = Math.hypot(dx, dy);
      const minGap = BODY_RADIUS * (a.build.scale + b.build.scale);
      if (gap >= minGap) continue;
      const nx = gap > 0.001 ? dx / gap : 1;
      const ny = gap > 0.001 ? dy / gap : 0;
      const overlap = minGap - gap;
      const isARested = a.rest !== undefined;
      const isBRested = b.rest !== undefined;
      const shareA = isARested === isBRested ? 0.5 : isARested ? 0 : 1;
      a.x -= nx * overlap * shareA;
      a.y -= ny * overlap * shareA;
      b.x += nx * overlap * (1 - shareA);
      b.y += ny * overlap * (1 - shareA);
    }
  }
}
