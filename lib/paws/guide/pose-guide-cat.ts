import { placeLegsAtRest } from "@/lib/paws/sim/place-legs-at-rest";
import { setCatState } from "@/lib/paws/sim/set-cat-state";
import type { World } from "@/lib/paws/sim/sim-types";

/** Put cat `userId` at `at` facing `at.heading`, then either settle it into a sit or sleep or walk it toward `goal`, and keep it from noticing fingers or other cats on its own. */
export function poseGuideCat(options: {
  world: World;
  userId: string;
  at: { x: number; y: number; heading: number };
  then:
    | { kind: "rest"; pose: "sit" | "sleep" }
    | { kind: "walk"; goal: { x: number; y: number } };
}) {
  const cat = options.world.cats[options.userId];
  if (cat === undefined) return;
  cat.x = options.at.x;
  cat.y = options.at.y;
  cat.heading = options.at.heading;
  cat.curiousCooldownUntil = Infinity;
  cat.socialCooldownUntil = Infinity;
  cat.zoomiesCooldownUntil = Infinity;
  const then = options.then;
  switch (then.kind) {
    case "rest":
      cat.weights = {
        stand: 0,
        sit: then.pose === "sit" ? 1 : 0,
        sleep: then.pose === "sleep" ? 1 : 0,
      };
      cat.rest = then.pose;
      setCatState(cat, then.pose);
      break;
    case "walk":
      cat.wander = then.goal;
      cat.rest = undefined;
      setCatState(cat, "approach");
      break;
    default: {
      const unknown: never = then;
      return unknown;
    }
  }
  placeLegsAtRest(cat);
}
