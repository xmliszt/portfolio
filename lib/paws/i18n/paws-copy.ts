import type { en } from "./copy/en";
import type { PawsLocale } from "./paws-locales";

/** Every visitor-facing string of Paws in one language, shaped like the English copy. */
export type PawsCopy = Omit<typeof en, "locale"> & { locale: PawsLocale };
