import type { CatLook } from "@/lib/paws/cat-look";

/** Return a medium ginger tabby look with any fields in `overrides` changed. */
export function buildLook(overrides: Partial<CatLook> = {}): CatLook {
  return {
    coat: "ginger",
    pattern: "tabby",
    belly: "cream",
    pads: "pink",
    size: "medium",
    fluff: "medium",
    tail: "medium",
    ears: "medium",
    ...overrides,
  };
}
