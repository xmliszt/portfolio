import { COAT_INKS, type CoatInk } from "@/lib/paws/cat-look";

const isCoatInk = (key: string): key is CoatInk =>
  Object.hasOwn(COAT_INKS, key);

/** Return every coat ink key in the order `COAT_INKS` lists them. */
export function coatInkOptions() {
  return Object.keys(COAT_INKS).filter(isCoatInk);
}
