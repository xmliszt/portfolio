import { pickFarSpot } from "./pick-far-spot";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

const COOLDOWN_SECONDS = 45;

/** Send `cat` on zoomies: two to three sprints, each to the farthest of a few random spots on the glass. */
export function startZoomies(options: { world: World; cat: SimCat }) {
  const { world, cat } = options;
  cat.rest = undefined;
  cat.zoomDashes = 2 + Math.floor(world.random() * 2);
  cat.zoomiesCooldownUntil =
    world.time + COOLDOWN_SECONDS * (1 + world.random());
  cat.wander = pickFarSpot({ world, cat });
  setCatState(cat, "zoom");
}

