import {
  BELLIES,
  type CatLook,
  COAT_INKS,
  type CoatInk,
  PAD_INKS,
  type PadInk,
  PATTERNS,
  STEPS,
} from "./cat-look";

const isOneOf = <T extends string>(
  options: readonly T[],
  value: unknown
): value is T => options.some((option) => option === value);
const isCoatInk = (value: unknown): value is CoatInk =>
  typeof value === "string" && Object.hasOwn(COAT_INKS, value);
const isPadInk = (value: unknown): value is PadInk =>
  typeof value === "string" && Object.hasOwn(PAD_INKS, value);

/** Return the cat look in `value`, or `undefined` when any field is missing or not one of the offered options. */
export function parseCatLook(value: unknown): CatLook | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("coat" in value && isCoatInk(value.coat)) ||
    !("pattern" in value && isOneOf(PATTERNS, value.pattern)) ||
    !("belly" in value && isOneOf(BELLIES, value.belly)) ||
    !("pads" in value && isPadInk(value.pads)) ||
    !("size" in value && isOneOf(STEPS, value.size)) ||
    !("fluff" in value && isOneOf(STEPS, value.fluff)) ||
    !("tail" in value && isOneOf(STEPS, value.tail)) ||
    !("ears" in value && isOneOf(STEPS, value.ears))
  ) {
    return undefined;
  }
  return {
    coat: value.coat,
    pattern: value.pattern,
    belly: value.belly,
    pads: value.pads,
    size: value.size,
    fluff: value.fluff,
    tail: value.tail,
    ears: value.ears,
  };
}
