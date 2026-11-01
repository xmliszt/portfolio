import { getBoxGap } from "./get-box-gap";
import { isCatOnstage } from "./is-cat-onstage";
import type { SimToy, World } from "./sim-types";

/** Distance per unit of cat scale that a cat's middle keeps from the box's walls unless it is hopping or resting inside. */
export const BOX_CLEARANCE = 50;

/** Push every cat in `world` that walks up to a box back out to `BOX_CLEARANCE`, leaving a cat hopping into, resting in or hopping out of that box, and cats whose middle is already inside. */
export function keepCatsOutOfBox(world: World) {
  for (const box of world.toys) {
    if (box.kind === "box") keepCatsOut({ world, box });
  }
}

function keepCatsOut(options: { world: World; box: SimToy }) {
  const { world, box } = options;
  for (const cat of Object.values(world.cats)) {
    if (!isCatOnstage(cat) || cat.state === "enter") continue;
    if (
      cat.boxVisit !== undefined &&
      cat.boxVisit.boxId === box.id &&
      cat.boxVisit.phase !== "go"
    )
      continue;
    const gap = getBoxGap({ box, x: cat.x, y: cat.y });
    const clearance = BOX_CLEARANCE * cat.build.scale;
    if (gap < 0 || gap >= clearance) continue;
    const away = Math.max(1, Math.hypot(cat.x - box.x, cat.y - box.y));
    cat.x += ((cat.x - box.x) / away) * (clearance - gap);
    cat.y += ((cat.y - box.y) / away) * (clearance - gap);
  }
}
