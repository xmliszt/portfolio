import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

export const STRIPE_LOCALES = {
  en: "en",
  "zh-Hans": "zh",
  "zh-Hant": "zh-TW",
  ja: "ja",
  ko: "ko",
  fr: "fr",
  de: "de",
  es: "es",
  "pt-BR": "pt-BR",
  it: "it",
  nl: "nl",
  tr: "tr",
  ru: "ru",
  uk: "auto",
  pl: "pl",
  id: "id",
  vi: "vi",
  hi: "auto",
} as const satisfies { [locale in LaundromatLocale]: string };
