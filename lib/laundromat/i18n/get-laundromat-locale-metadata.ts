import type { Metadata } from "next";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";

import { getLaundromatCopy } from "./get-laundromat-copy";
import type { LaundromatLocale } from "./laundromat-locales";
import { LAUNDROMAT_LOCALES } from "./laundromat-locales";

const OPEN_GRAPH_IMAGE_URL = `${LAUNDROMAT_ORIGIN}/laundromat/opengraph-image`;

function getLocaleUrl(locale: LaundromatLocale) {
  return `${LAUNDROMAT_ORIGIN}/${locale}`;
}

/** Return the page metadata for `locale`: its title, description, keywords and Open Graph locale, its own URL as canonical, and every language's URL as an alternate. */
export function getLaundromatLocaleMetadata(
  locale: LaundromatLocale
): Metadata {
  const { site } = getLaundromatCopy(locale);
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
      canonical: getLocaleUrl(locale),
      languages: {
        ...Object.fromEntries(
          LAUNDROMAT_LOCALES.map((each) => [each, getLocaleUrl(each)])
        ),
        "x-default": LAUNDROMAT_ORIGIN,
      },
    },
    openGraph: {
      title: site.title,
      description: site.description,
      url: getLocaleUrl(locale),
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
