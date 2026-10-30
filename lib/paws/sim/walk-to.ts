import { clamp } from "./clamp";
import { damp } from "./damp";
import { isCatOnstage } from "./is-cat-onstage";
import type { Point, SimCat, Tick } from "./sim-types";
import { wrapAngle } from "./wrap-angle";

/** Steer `cat` toward `goal` at `pace` times its walking speed, keeping clear of other cats except `ignoreId`, and return the distance left. */
export function walkTo(options: {
  tick: Tick;
  cat: SimCat;
  goal: Point;
  pace: number;
  ignoreId?: string;
}) {
  const { tick, cat, goal } = options;
  const k = cat.build.scale;
  const gap = Math.hypot(goal.x - cat.x, goal.y - cat.y);
  const away = Object.values(tick.world.cats)
    .filter(
      (other) =>
        other !== cat &&
        other.userId !== options.ignoreId &&
        isCatOnstage(other)
    )
    .reduce(
      (push, other) => {
        const d = Math.hypot(cat.x - other.x, cat.y - other.y);
        const range = 150 * (k + other.build.scale);
        if (d >= range || d <= 0.1) return push;
        const strength = (1 - d / range) ** 2 * 4;
        return {
          x: push.x + ((cat.x - other.x) / d) * strength,
          y: push.y + ((cat.y - other.y) / d) * strength,
        };
      },
      {
        x: (goal.x - cat.x) / Math.max(gap, 1),
        y: (goal.y - cat.y) / Math.max(gap, 1),
      }
    );
  const turn = wrapAngle(Math.atan2(away.y, away.x) - cat.heading);
  cat.angVel = damp({
    from: cat.angVel,
    to: clamp(turn * 2.6, -2.4, 2.4),
    rate: 6,
    dtSeconds: tick.dtSeconds,
  });
  cat.speedTarget =
    115 *
    k *
    options.pace *
    clamp(gap / (90 * k), 0.2, 1) *
    (Math.abs(turn) > 1.1 ? 0.35 : 1);
  return gap;
}
