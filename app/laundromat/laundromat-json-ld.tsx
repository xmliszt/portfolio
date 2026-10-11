import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { INSPIRATION_BOOK } from "@/lib/laundromat/inspiration-book";

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
        image: `${LAUNDROMAT_ORIGIN}/laundromat/og.png`,
        isPartOf: { "@id": `${LAUNDROMAT_ORIGIN}/#website` },
        author,
        creator: author,
        isBasedOn: {
          "@type": "Book",
          name: INSPIRATION_BOOK.title,
          alternateName: INSPIRATION_BOOK.originalTitle,
          isbn: INSPIRATION_BOOK.isbn,
          url: INSPIRATION_BOOK.url,
          author: {
            "@type": "Person",
            name: INSPIRATION_BOOK.author,
            alternateName: INSPIRATION_BOOK.originalAuthor,
            url: INSPIRATION_BOOK.authorUrl,
            sameAs: [INSPIRATION_BOOK.authorInstagramUrl],
          },
          translator: {
            "@type": "Person",
            name: INSPIRATION_BOOK.translator,
            sameAs: [INSPIRATION_BOOK.translatorXUrl],
          },
        },
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
