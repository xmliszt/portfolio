import { dropSocial } from "./drop-social";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

/** End `cat`'s plan with another cat and let it pause for a moment. */
export function endSocial(options: { world: World; cat: SimCat }) {
  dropSocial(options);
  options.cat.rest = undefined;
  options.cat.pauseSeconds = 0.6 + options.world.random() * 1.5;
  setCatState(options.cat, "pause");
}
