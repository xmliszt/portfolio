import type { MetadataRoute } from "next";

import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: PAWS_ORIGIN,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
