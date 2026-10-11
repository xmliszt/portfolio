import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

type LaundromatJsonLdProps = {
  name: string;
  description: string;
  locale: LaundromatLocale;
};

export function LaundromatJsonLd(props: LaundromatJsonLdProps) {
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
        "@id": `${LAUNDROMAT_ORIGIN}/#website`,
        name: props.name,
        url: LAUNDROMAT_ORIGIN,
        description: props.description,
        inLanguage: props.locale,
        author,
      },
      {
        "@type": "WebApplication",
        "@id": `${LAUNDROMAT_ORIGIN}/#app`,
        name: props.name,
        url: LAUNDROMAT_ORIGIN,
        description: props.description,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        image: `${LAUNDROMAT_ORIGIN}/laundromat/opengraph-image`,
        isPartOf: { "@id": `${LAUNDROMAT_ORIGIN}/#website` },
        author,
        creator: author,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
