import { BELLIES, type CatLook, PATTERNS, STEPS } from "@/lib/paws/cat-look";

import { coatInkOptions } from "./coat-ink-options";
import { padInkOptions } from "./pad-ink-options";
import { pickOption } from "./pick-option";

/** Return a cat look with every field drawn from its offered options using `random`. */
export function shuffleCatLook(options: { random: () => number }): CatLook {
  const random = options.random;
  return {
    coat: pickOption({ options: coatInkOptions(), random }),
    pattern: pickOption({ options: PATTERNS, random }),
    belly: pickOption({ options: BELLIES, random }),
    pads: pickOption({ options: padInkOptions(), random }),
    size: pickOption({ options: STEPS, random }),
    fluff: pickOption({ options: STEPS, random }),
    tail: pickOption({ options: STEPS, random }),
    ears: pickOption({ options: STEPS, random }),
  };
}
