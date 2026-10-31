import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

const RESTING_STATES = new Set(["settle", "sit", "sleep"]);

/** Bring `cat` to its feet for 2–4 s when it is sitting, sleeping or settling to rest; leave it as it is otherwise. */
export function standUp(options: { world: World; cat: SimCat }) {
  const { world, cat } = options;
  if (!RESTING_STATES.has(cat.state)) return;
  cat.rest = undefined;
  cat.pauseSeconds = 2 + world.random() * 2;
  setCatState(cat, "pause");
}
