import {
  BELLIES,
  type CatLook,
  COAT_INKS,
  PAD_INKS,
  PATTERNS,
  STEPS,
  TAIL_SHAPES,
} from "@/lib/paws/cat-look";

/** The look fields a cat code spells, one character each in this order, with the options each character indexes; options may only be appended, or old links read as other cats. */
export const CAT_LOOK_CODE_FIELDS = [
  { field: "coat", options: Object.keys(COAT_INKS) },
  { field: "pattern", options: PATTERNS },
  { field: "belly", options: BELLIES },
  { field: "pads", options: Object.keys(PAD_INKS) },
  { field: "size", options: STEPS },
  { field: "fluff", options: STEPS },
  { field: "tail", options: STEPS },
  { field: "tailShape", options: TAIL_SHAPES },
  { field: "ears", options: STEPS },
] as const satisfies { field: keyof CatLook; options: readonly string[] }[];
