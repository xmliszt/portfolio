import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";

export type ShareImageLocale = Exclude<LaundromatLocale, "hi">;

// next/og does no Devanagari shaping, so Hindi conjuncts would fall apart; Hindi pages use the text-free og.png.
export const SHARE_IMAGE_LOCALES = LAUNDROMAT_LOCALES.filter(
  (locale): locale is ShareImageLocale => locale !== "hi"
);
