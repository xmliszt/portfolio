import { PAD_INKS, type PadInk } from "@/lib/paws/cat-look";

const isPadInk = (key: string): key is PadInk => Object.hasOwn(PAD_INKS, key);

/** Return every toe bean ink key in the order `PAD_INKS` lists them. */
export function padInkOptions() {
  return Object.keys(PAD_INKS).filter(isPadInk);
}
