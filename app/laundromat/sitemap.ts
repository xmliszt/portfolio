import type { MetadataRoute } from "next";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { getLaundromatLocaleUrl } from "@/lib/laundromat/i18n/get-laundromat-locale-url";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";
import { LEGAL_PAGES } from "@/lib/laundromat/legal/legal-pages";

// No `alternates`: Next writes `xhtml:link` before `lastmod`, which breaks the sitemaps.org schema; each page's `<head>` already lists its hreflang links.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...LAUNDROMAT_LOCALES.map((locale): MetadataRoute.Sitemap[number] => ({
      url: getLaundromatLocaleUrl(locale),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    })),
    ...Object.values(LEGAL_PAGES).map(
      (page): MetadataRoute.Sitemap[number] => ({
        url: `${LAUNDROMAT_ORIGIN}${page.path}`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      })
    ),
  ];
}
