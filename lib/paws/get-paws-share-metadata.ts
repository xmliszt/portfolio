import type { Metadata } from "next";

import { PAWS_SEO } from "./paws-seo";

/** Return the Open Graph and Twitter card fields of the Paws page at `url` whose link preview shows `title`, `description` and `image`. */
export function getPawsShareMetadata(options: {
  url: string;
  title: string;
  description: string;
  image: { url: string; width: number; height: number; alt: string };
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      url: options.url,
      siteName: PAWS_SEO.name,
      title: options.title,
      description: options.description,
      images: [options.image],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [options.image.url],
    },
  };
}
