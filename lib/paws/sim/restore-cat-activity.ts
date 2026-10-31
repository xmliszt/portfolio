import type { CatActivity } from "@/lib/paws/wire-types";

import { pickRandomSpot } from "./pick-random-spot";
import { setCatState } from "./set-cat-state";
import type { SimCat, World } from "./sim-types";
import { startLeaving } from "./start-leaving";

/** Put `cat` back into the state that `activity` describes, as close as possible without knowing its partner or finger. */
export function restoreCatActivity(options: {
  world: World;
  cat: SimCat;
  activity: CatActivity;
}) {
  const { world, cat } = options;
  const rest = ((): SimCat["rest"] => {
    if (cat.weights.sleep > 0.5) return "sleep";
    if (cat.weights.sit > 0.5) return "sit";
    return undefined;
  })();
  cat.rest = rest;
  switch (options.activity) {
    case "enter":
    case "approach":
      cat.wander = pickRandomSpot({ world, cat });
      setCatState(cat, options.activity);
      return;
    case "settle":
      setCatState(cat, "settle");
      return;
    case "sit":
    case "sleep":
      cat.rest = rest ?? options.activity;
      setCatState(cat, cat.rest);
      return;
    case "pause":
    case "sniff":
    case "paw":
    case "greet":
    case "chase":
    case "chased":
    case "bat":
      setCatState(cat, rest ?? "pause");
      return;
    case "leave":
      startLeaving({ world, cat });
      return;
    default: {
      const unknown: never = options.activity;
      return unknown;
    }
  }
}
