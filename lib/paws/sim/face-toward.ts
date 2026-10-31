import { clamp } from "./clamp";
import { damp } from "./damp";
import type { Point, SimCat, Tick } from "./sim-types";
import { wrapAngle } from "./wrap-angle";

/** Stop `cat` and turn it to face `point`, returning how far off it still faces in radians. */
export function faceToward(options: { tick: Tick; cat: SimCat; point: Point }) {
  const { cat, point } = options;
  const turn = wrapAngle(
    Math.atan2(point.y - cat.y, point.x - cat.x) - cat.heading
  );
  cat.speedTarget = 0;
  cat.angVel = damp({
    from: cat.angVel,
    to: clamp(turn * 2.5, -1.4, 1.4),
    rate: 5,
    dtSeconds: options.tick.dtSeconds,
  });
  return Math.abs(turn);
}
