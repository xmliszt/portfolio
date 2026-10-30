import type { Point, ReachTarget, World } from "./sim-types";

/** Return where `target` is now, or `undefined` once its finger or cat is gone. */
export function resolveReachTarget(options: {
  world: World;
  target: ReachTarget;
}): Point | undefined {
  const { world, target } = options;
  switch (target.kind) {
    case "finger": {
      const finger = world.fingers[target.userId];
      return finger?.present ? { x: finger.x, y: finger.y } : undefined;
    }
    case "tail":
      return world.cats[target.catId]?.derived.tailTip;
    default: {
      const unknown: never = target;
      return unknown;
    }
  }
}
