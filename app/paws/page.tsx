import type { Metadata } from "next";
import { cookies, headers } from "next/headers";

import { resolveLaundromatLocale } from "@/lib/laundromat/i18n/resolve-laundromat-locale";
import { getVisitorLocation } from "@/lib/laundromat/weather/get-visitor-location";
import { getPawsShareMetadata } from "@/lib/paws/get-paws-share-metadata";
import { PAWS_LOCALE_COOKIE } from "@/lib/paws/i18n/paws-locales";
import { PAWS_SEO } from "@/lib/paws/paws-seo";
import { CAT_CARD } from "@/lib/paws/share/cat-card";
import { decodeCatLook } from "@/lib/paws/share/decode-cat-look";
import { getCatCardPath } from "@/lib/paws/share/get-cat-card-path";

import { PawsCopyProvider } from "./_i18n/paws-copy-provider";
import { PawsRoom } from "./_room/paws-room";
import { PawsSessionProvider } from "./_session/paws-session-provider";

type PawsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  props: PawsPageProps
): Promise<Metadata> {
  const { cat } = await props.searchParams;
  const look = typeof cat === "string" ? decodeCatLook(cat) : undefined;
  if (look === undefined) return {};
  return getPawsShareMetadata({
    url: `/?cat=${cat}`,
    title: PAWS_SEO.inviteTitle,
    description: PAWS_SEO.inviteDescription,
    image: {
      url: getCatCardPath(look),
      width: CAT_CARD.width,
      height: CAT_CARD.height,
      alt: PAWS_SEO.inviteImageAlt,
    },
  });
}

export default async function PawsPage() {
  const requestHeaders = await headers();
  const location = getVisitorLocation(requestHeaders);
  const locale = resolveLaundromatLocale({
    cookieLocale: (await cookies()).get(PAWS_LOCALE_COOKIE)?.value,
    acceptLanguage: requestHeaders.get("accept-language") ?? undefined,
  });
  return (
    <PawsCopyProvider locale={locale}>
      <PawsSessionProvider>
        <PawsRoom
          location={
            location === undefined
              ? undefined
              : { latitude: location.latitude, longitude: location.longitude }
          }
        />
      </PawsSessionProvider>
    </PawsCopyProvider>
  );
}
