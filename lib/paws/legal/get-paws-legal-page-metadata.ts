import type { Metadata } from "next";

import { getPawsShareMetadata } from "@/lib/paws/get-paws-share-metadata";
import { PAWS_SEO } from "@/lib/paws/paws-seo";

/** Return the metadata of the Paws legal page at `path`: its title, description, own path as canonical, and link previews with the Paws share image. */
export function getPawsLegalPageMetadata(options: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const fullTitle = `${options.title} · ${PAWS_SEO.name}`;
  return {
    title: fullTitle,
    description: options.description,
    alternates: { canonical: options.path },
    ...getPawsShareMetadata({
      url: options.path,
      title: fullTitle,
      description: options.description,
      image: {
        url: PAWS_SEO.shareImage.path,
        width: PAWS_SEO.shareImage.width,
        height: PAWS_SEO.shareImage.height,
        alt: PAWS_SEO.shareDescription,
      },
    }),
  };
}
