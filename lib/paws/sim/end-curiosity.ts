import { pickRandomSpot } from "./pick-random-spot";
import { releasePaws } from "./release-paws";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

const ATTENTIVE_STATES = new Set([
  "approach",
  "pause",
  "settle",
  "sniff",
  "paw",
]);

/** Make `cat` lose interest in its finger, wait 15–40 s before it can be curious again, and wander off if it was attending. */
export function endCuriosity(options: { world: World; cat: SimCat }) {
  const { world, cat } = options;
  cat.focusId = undefined;
  cat.pawFingerIds = [];
  cat.curiousCooldownUntil = world.time + 15 + world.random() * 25;
  if (!ATTENTIVE_STATES.has(cat.state)) return;
  releasePaws(cat);
  cat.rest = undefined;
  cat.wander = pickRandomSpot({ world, cat });
  setCatState(cat, "approach");
}
