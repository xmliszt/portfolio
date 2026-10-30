import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";
import { PAWS_SEO } from "@/lib/paws/paws-seo";

/** Render the structured data that describes Paws as a free web app by Li Yuxuan. */
export function PawsJsonLd() {
  const author = {
    "@type": "Person",
    name: "Li Yuxuan",
    url: "https://liyuxuan.dev/about",
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${PAWS_ORIGIN}/#website`,
        name: PAWS_SEO.name,
        url: PAWS_ORIGIN,
        description: PAWS_SEO.description,
        author,
      },
      {
        "@type": "WebApplication",
        "@id": `${PAWS_ORIGIN}/#app`,
        name: PAWS_SEO.name,
        url: PAWS_ORIGIN,
        description: PAWS_SEO.appDescription,
        image: `${PAWS_ORIGIN}${PAWS_SEO.shareImage.path}`,
        applicationCategory: "GameApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
