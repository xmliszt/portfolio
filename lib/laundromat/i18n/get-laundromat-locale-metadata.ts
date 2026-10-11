import type { Metadata } from "next";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";

import { getLaundromatCopy } from "./get-laundromat-copy";
import { getLaundromatLanguageUrls } from "./get-laundromat-language-urls";
import { getLaundromatLocaleUrl } from "./get-laundromat-locale-url";
import type { LaundromatLocale } from "./laundromat-locales";
import { LAUNDROMAT_LOCALES } from "./laundromat-locales";

const OPEN_GRAPH_IMAGE_URL = `${LAUNDROMAT_ORIGIN}/laundromat/og.png`;

/** Return the page metadata for `locale`: its title, description, keywords and Open Graph locale, its own URL as canonical, and every language's URL as an alternate. */
export function getLaundromatLocaleMetadata(
  locale: LaundromatLocale
): Metadata {
  const { site } = getLaundromatCopy(locale);
  const localeUrl = getLaundromatLocaleUrl(locale);
  const image = {
    url: OPEN_GRAPH_IMAGE_URL,
    width: 1200,
    height: 630,
    alt: site.title,
  };
  return {
    title: { absolute: site.title },
    description: site.description,
    keywords: [...site.keywords, site.name, "Li Yuxuan"],
    alternates: {
      canonical: localeUrl,
      languages: getLaundromatLanguageUrls(),
    },
    openGraph: {
      title: site.title,
      description: site.description,
      url: localeUrl,
      siteName: site.name,
      locale: site.openGraphLocale,
      alternateLocale: LAUNDROMAT_LOCALES.filter((each) => each !== locale).map(
        (each) => getLaundromatCopy(each).site.openGraphLocale
      ),
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      creator: "@xmliszt",
      creatorId: "1704579643",
      images: [image],
    },
  };
}
