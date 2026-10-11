import type { en } from "./copy/en";
import type { LaundromatLocale } from "./laundromat-locales";

/** Every visitor-facing string of the laundromat in one language, shaped like the English copy. */
export type LaundromatCopy = Omit<typeof en, "locale"> & {
  locale: LaundromatLocale;
};
