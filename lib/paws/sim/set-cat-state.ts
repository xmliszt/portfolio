import type { SimCat, SimState } from "./sim-types";

/** Switch `cat` to `state` and restart its time in that state, ending its box visit unless `state` is `"box"`. */
export function setCatState(cat: SimCat, state: SimState) {
  cat.state = state;
  cat.stateT = 0;
  if (state === "sniff") cat.hasNosed = false;
  if (state !== "box") cat.boxVisit = undefined;
}
