import { catToWorld } from "./cat-to-world";
import { getCatFrame } from "./get-cat-frame";
import type { SimCat } from "./sim-types";

/** Put every paw of `cat` flat on the glass under its resting spot in the current pose. */
export function placeLegsAtRest(cat: SimCat) {
  const frame = getCatFrame(cat);
  for (const leg of cat.legs) {
    const offset = (leg.front ? cat.pose.front : cat.pose.hind)[
      leg.side < 0 ? 0 : 1
    ];
    [leg.x, leg.y] = catToWorld(frame, offset);
    leg.idealX = leg.x;
    leg.idealY = leg.y;
    leg.h = 0;
    leg.swing = undefined;
    leg.reach = undefined;
  }
}
