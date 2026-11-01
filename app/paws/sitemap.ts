import type { MetadataRoute } from "next";

import { PAWS_LEGAL_PAGES } from "@/lib/paws/legal/paws-legal-pages";
import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: PAWS_ORIGIN,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...Object.values(PAWS_LEGAL_PAGES).map(
      (page): MetadataRoute.Sitemap[number] => ({
        url: `${PAWS_ORIGIN}${page.path}`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      })
    ),
  ];
}
