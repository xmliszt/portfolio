import { damp } from "./damp";
import { emitCatSound } from "./emit-cat-sound";
import { lerp } from "./lerp";
import { resolveReachTarget } from "./resolve-reach-target";
import type { Reach, SimCat, SimLeg, Tick } from "./sim-types";
import { startReach } from "./start-reach";

const MEOW_ON_TOUCH_CHANCE = 0.5;

/** Move `leg` one step along its paw movement: keep a planted paw on its target, re-reach when the target slides away, knead now and then, and sometimes meow when a paw lands on a finger. */
export function updateReach(options: {
  tick: Tick;
  cat: SimCat;
  leg: SimLeg;
  legIndex: number;
  reach: Reach;
}) {
  const { tick, cat, leg, reach } = options;
  const { world, dtSeconds } = tick;
  reach.t += dtSeconds;
  const goal = resolveReachTarget({ world, target: reach.target }) ?? {
    x: leg.x,
    y: leg.y,
  };
  if (reach.phase === "planted") {
    leg.h = damp({ from: leg.h, to: 0, rate: 14, dtSeconds });
    const off = Math.hypot(leg.x - goal.x, leg.y - goal.y);
    if (off <= 10) {
      reach.notice = 0;
      if (reach.t > reach.kneadSeconds) {
        startReach({
          world,
          leg,
          phase: "pat",
          to: { x: leg.x, y: leg.y },
          durationSeconds: 0.32,
          lift: 4 + world.random() * 3,
        });
      }
      return;
    }
    reach.notice += dtSeconds;
    if (reach.notice <= reach.reactSeconds) return;
    if (off > 45 || world.random() < 0.3) {
      startReach({
        world,
        leg,
        phase: "retract",
        to: { x: leg.idealX, y: leg.idealY },
        durationSeconds: 0.3,
        lift: 6,
      });
    } else {
      startReach({
        world,
        leg,
        phase: "extend",
        durationSeconds: 0.22 + world.random() * 0.12,
        lift: 5 + world.random() * 4,
      });
    }
    return;
  }
  if (reach.phase === "hold") {
    leg.x = damp({ from: leg.x, to: leg.idealX, rate: 4, dtSeconds });
    leg.y = damp({ from: leg.y, to: leg.idealY, rate: 4, dtSeconds });
    leg.h = damp({ from: leg.h, to: 7, rate: 6, dtSeconds });
    if (reach.t > reach.waitSeconds) {
      startReach({
        world,
        leg,
        phase: "extend",
        durationSeconds: 0.3 + world.random() * 0.1,
        lift: 10,
      });
    }
    return;
  }
  const progress = Math.min(1, reach.t / reach.durationSeconds);
  const eased = progress * progress * (3 - 2 * progress);
  leg.x = lerp(reach.fromX, reach.toX, eased);
  leg.y = lerp(reach.fromY, reach.toY, eased);
  leg.h =
    lerp(reach.fromH, reach.endH, progress) +
    Math.sin(Math.PI * progress) * reach.lift;
  if (progress < 1) return;
  if (reach.phase === "retract") {
    reach.phase = "hold";
    reach.t = 0;
    return;
  }
  leg.h = 0;
  tick.events.push({
    kind: "pawPrint",
    userId: cat.userId,
    x: leg.x,
    y: leg.y,
    angle: cat.heading,
    leg: options.legIndex,
  });
  if (
    (reach.phase === "extend" || reach.phase === "pat") &&
    reach.target.kind === "finger" &&
    tick.world.random() < MEOW_ON_TOUCH_CHANCE
  ) {
    emitCatSound({ tick, cat, sound: "meow" });
  }
  Object.assign(reach, {
    phase: "planted",
    t: 0,
    notice: 0,
    reactSeconds: 0.25 + world.random() * 0.65,
    kneadSeconds: 2.5 + world.random() * 3,
  });
}
