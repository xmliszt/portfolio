import { dropSocial } from "./drop-social";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

const DISTRACTIBLE_STATES = new Set([
  "pause",
  "approach",
  "enter",
  "greet",
  "chase",
  "chased",
  "bat",
]);

/** Make `cat` curious about the finger of player `fingerId` for a random 8–25 s, dropping any plan it had with another cat. */
export function makeCurious(options: {
  world: World;
  cat: SimCat;
  fingerId: string;
}) {
  const { world, cat } = options;
  if (cat.social !== undefined || cat.isSnuggling) dropSocial({ world, cat });
  cat.focusId = options.fingerId;
  cat.curiousUntil = world.time + 8 + world.random() * 17;
  if (DISTRACTIBLE_STATES.has(cat.state)) {
    cat.rest = undefined;
    setCatState(cat, "approach");
  }
}
