export const LAUNDROMAT_LOCALES = [
  "en",
  "zh-Hans",
  "zh-Hant",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "pt-BR",
  "it",
  "nl",
  "tr",
  "ru",
  "uk",
  "pl",
  "id",
  "vi",
  "hi",
] as const;

export type LaundromatLocale = (typeof LAUNDROMAT_LOCALES)[number];

export const DEFAULT_LAUNDROMAT_LOCALE = "en" satisfies LaundromatLocale;

export const LAUNDROMAT_LOCALE_COOKIE = "laundromat-locale";
