import { setCatState } from "./set-cat-state";
import type { SimCat } from "./sim-types";

const RESTING_STATES = new Set(["settle", "sit", "sleep"]);

/** Bring `cat` to its feet when it is sitting, sleeping or settling to rest; leave it as it is otherwise. */
export function standUp(cat: SimCat) {
  if (!RESTING_STATES.has(cat.state)) return;
  cat.rest = undefined;
  setCatState(cat, "pause");
}
