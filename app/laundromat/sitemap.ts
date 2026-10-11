import type { MetadataRoute } from "next";

import { getLaundromatLanguageUrls } from "@/lib/laundromat/i18n/get-laundromat-language-urls";
import { getLaundromatLocaleUrl } from "@/lib/laundromat/i18n/get-laundromat-locale-url";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";

export default function sitemap(): MetadataRoute.Sitemap {
  const languageUrls = getLaundromatLanguageUrls();
  return LAUNDROMAT_LOCALES.map((locale) => ({
    url: getLaundromatLocaleUrl(locale),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
    alternates: { languages: languageUrls },
  }));
}
