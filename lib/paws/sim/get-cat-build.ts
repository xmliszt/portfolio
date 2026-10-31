import type { CatLook, Step } from "@/lib/paws/cat-look";

/** World units per cat-local unit for a medium cat. */
const BASE_SCALE = 0.6;

const SIZE_SCALE = { small: 0.88, medium: 1, large: 1.25 } as const satisfies {
  [step in Step]: number;
};
const FLUFF = { small: 0.45, medium: 1, large: 1.7 } as const satisfies {
  [step in Step]: number;
};
const TAIL_RADIUS = { small: 7, medium: 9.5, large: 13 } as const satisfies {
  [step in Step]: number;
};
const EAR_SCALE = { small: 0.85, medium: 1, large: 1.3 } as const satisfies {
  [step in Step]: number;
};

export type CatBuild = {
  /** World units per cat-local unit. */
  scale: number;
  /** Extra edge softness in cat-local units, added to every part's blur. */
  fluff: number;
  tailRadius: number;
  earScale: number;
};

/** Return the body proportions a cat with `look` is built and drawn with. */
export function getCatBuild(look: CatLook): CatBuild {
  return {
    scale: BASE_SCALE * SIZE_SCALE[look.size],
    fluff: FLUFF[look.fluff],
    tailRadius: TAIL_RADIUS[look.tail],
    earScale: EAR_SCALE[look.ears],
  };
}
