import {
  BELLIES,
  type CatLook,
  PATTERNS,
  STEPS,
  TAIL_SHAPES,
} from "@/lib/paws/cat-look";

import { coatInkOptions } from "./coat-ink-options";
import { padInkOptions } from "./pad-ink-options";
import { pickOption } from "./pick-option";

/** Return a cat look with every field drawn from its offered options using `random`, and `tailShape` using `tailShapeRandom` when given. */
export function shuffleCatLook(options: {
  random: () => number;
  tailShapeRandom?: () => number;
}): CatLook {
  const random = options.random;
  return {
    coat: pickOption({ options: coatInkOptions(), random }),
    pattern: pickOption({ options: PATTERNS, random }),
    belly: pickOption({ options: BELLIES, random }),
    pads: pickOption({ options: padInkOptions(), random }),
    size: pickOption({ options: STEPS, random }),
    fluff: pickOption({ options: STEPS, random }),
    tail: pickOption({ options: STEPS, random }),
    tailShape: pickOption({
      options: TAIL_SHAPES,
      random: options.tailShapeRandom ?? random,
    }),
    ears: pickOption({ options: STEPS, random }),
  };
}
