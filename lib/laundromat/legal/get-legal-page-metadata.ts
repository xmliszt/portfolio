import type { Metadata } from "next";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { en } from "@/lib/laundromat/i18n/copy/en";

/** Return the metadata of the legal page at `path`: its title, description, own URL as canonical, and matching Open Graph and Twitter cards. */
export function getLegalPageMetadata(options: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${LAUNDROMAT_ORIGIN}${options.path}`;
  const fullTitle = `${options.title} · ${en.site.name}`;
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: options.description,
      url,
      siteName: en.site.name,
      locale: en.site.openGraphLocale,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description: options.description,
      creator: "@xmliszt",
      creatorId: "1704579643",
    },
  };
}
