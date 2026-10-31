import { releasePaws } from "./release-paws";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";

/** Clear `cat`'s plan with another cat, and send that partner back to a pause when the plan was shared. */
export function dropSocial(options: { world: World; cat: SimCat }) {
  const { world, cat } = options;
  const partner =
    cat.partnerId === undefined ? undefined : world.cats[cat.partnerId];
  if (cat.social?.kind === "bat") releasePaws(cat);
  cat.social = undefined;
  cat.partnerId = undefined;
  cat.isSnuggling = false;
  if (partner === undefined || partner.partnerId !== cat.userId) return;
  partner.social = undefined;
  partner.partnerId = undefined;
  partner.rest = undefined;
  partner.pauseSeconds = 1 + world.random() * 2;
  setCatState(partner, "pause");
}
