import { LAUNDROMAT_LOCALES } from "./laundromat-locales";

const TRADITIONAL_CHINESE_REGIONS = ["tw", "hk", "mo"];

/** Return the supported locale that the language tag `tag` asks for, matching case-insensitively and falling back from a regional tag to its language, or `undefined` when none fits. */
export function parseLaundromatLocale(tag: string) {
  const lowered = tag.trim().toLowerCase();
  const exact = LAUNDROMAT_LOCALES.find(
    (locale) => locale.toLowerCase() === lowered
  );
  if (exact !== undefined) return exact;
  const [language = "", ...subtags] = lowered.split(/[-_]/);
  if (language === "zh") {
    const isTraditional = subtags.some(
      (subtag) =>
        subtag === "hant" || TRADITIONAL_CHINESE_REGIONS.includes(subtag)
    );
    return isTraditional ? "zh-Hant" : "zh-Hans";
  }
  return LAUNDROMAT_LOCALES.find(
    (locale) => locale.toLowerCase().split("-").at(0) === language
  );
}
