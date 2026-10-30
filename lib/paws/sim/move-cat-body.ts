import { damp } from "./damp";
import { isCatOnstage } from "./is-cat-onstage";
import type { SimCat } from "./sim-types";
import { wrapAngle } from "./wrap-angle";

const FAST_STATES = new Set(["flee", "chase", "chased"]);

/** Move `cat` along its heading at its eased speed and turn it, bending the spine into the turn. */
export function moveCatBody(options: { cat: SimCat; dtSeconds: number }) {
  const { cat, dtSeconds } = options;
  if (!isCatOnstage(cat)) return;
  cat.speed = damp({
    from: cat.speed,
    to: cat.speedTarget,
    rate: FAST_STATES.has(cat.state) ? 6 : 3.5,
    dtSeconds,
  });
  cat.heading = wrapAngle(cat.heading + cat.angVel * dtSeconds);
  cat.x += Math.cos(cat.heading) * cat.speed * dtSeconds;
  cat.y += Math.sin(cat.heading) * cat.speed * dtSeconds;
  cat.bend = damp({ from: cat.bend, to: cat.angVel * 7, rate: 5, dtSeconds });
}
