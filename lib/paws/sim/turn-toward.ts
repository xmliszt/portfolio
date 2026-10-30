import { damp } from "./damp";
import type { Point, SimCat, Tick } from "./sim-types";
import { wrapAngle } from "./wrap-angle";

/** Stop `cat` and turn it slowly toward `point`, only once it is well off to one side. */
export function turnToward(options: { tick: Tick; cat: SimCat; point: Point }) {
  const { cat, point } = options;
  const turn = wrapAngle(
    Math.atan2(point.y - cat.y, point.x - cat.x) - cat.heading
  );
  cat.speedTarget = 0;
  cat.angVel = damp({
    from: cat.angVel,
    to: Math.abs(turn) > 0.75 ? Math.sign(turn) * 0.8 : 0,
    rate: 4,
    dtSeconds: options.tick.dtSeconds,
  });
}
