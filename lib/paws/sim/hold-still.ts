import { damp } from "./damp";
import type { SimCat, Tick } from "./sim-types";

/** Bring `cat` to a stop and stop it turning. */
export function holdStill(options: { tick: Tick; cat: SimCat }) {
  options.cat.speedTarget = 0;
  options.cat.angVel = damp({
    from: options.cat.angVel,
    to: 0,
    rate: 6,
    dtSeconds: options.tick.dtSeconds,
  });
}
