import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

/** Return the handwriting script text written in `locale` is drawn with. */
export function getLocaleScript(locale: LaundromatLocale): NotebookScript {
  switch (locale) {
    case "zh-Hans":
    case "zh-Hant":
      return "chinese";
    case "ja":
      return "japanese";
    case "ko":
      return "korean";
    case "hi":
      return "devanagari";
    case "en":
    case "fr":
    case "de":
    case "es":
    case "pt-BR":
    case "it":
    case "nl":
    case "tr":
    case "ru":
    case "uk":
    case "pl":
    case "id":
    case "vi":
      return "latin";
    default: {
      const unreachable: never = locale;
      return unreachable;
    }
  }
}
