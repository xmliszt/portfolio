import type { MetadataRoute } from "next";

import { getLaundromatLocaleUrl } from "@/lib/laundromat/i18n/get-laundromat-locale-url";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";

// No `alternates`: Next writes `xhtml:link` before `lastmod`, which breaks the sitemaps.org schema; each page's `<head>` already lists its hreflang links.
export default function sitemap(): MetadataRoute.Sitemap {
  return LAUNDROMAT_LOCALES.map((locale) => ({
    url: getLaundromatLocaleUrl(locale),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  }));
}
