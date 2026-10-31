import { resolveReachTarget } from "./resolve-reach-target";
import type { Point, Reach, ReachTarget, SimLeg, World } from "./sim-types";

/** Start one paw movement of `leg` toward `target`: `extend` and `pat` land on the glass, `retract` pulls the paw back up under the shoulder to `to`. */
export function startReach(options: {
  world: World;
  leg: SimLeg;
  phase: "extend" | "pat" | "retract";
  target?: ReachTarget;
  to?: Point;
  durationSeconds: number;
  lift: number;
}) {
  const { world, leg } = options;
  const target = options.target ?? leg.reach?.target;
  if (target === undefined) return;
  const goal = options.to ??
    resolveReachTarget({ world, target }) ?? { x: leg.x, y: leg.y };
  const reach: Reach = {
    phase: options.phase,
    t: 0,
    notice: 0,
    fromX: leg.x,
    fromY: leg.y,
    fromH: leg.h,
    toX: goal.x,
    toY: goal.y,
    endH: options.phase === "retract" ? 7 : 0,
    durationSeconds: options.durationSeconds,
    lift: options.lift,
    target,
    reactSeconds: 0.25 + world.random() * 0.65,
    kneadSeconds: 2.5 + world.random() * 3,
    waitSeconds: 0.3 + world.random() * 0.5,
  };
  leg.swing = undefined;
  leg.reach = reach;
}
