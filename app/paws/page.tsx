import { cookies, headers } from "next/headers";

import { resolveLaundromatLocale } from "@/lib/laundromat/i18n/resolve-laundromat-locale";
import { getVisitorLocation } from "@/lib/laundromat/weather/get-visitor-location";
import { PAWS_LOCALE_COOKIE } from "@/lib/paws/i18n/paws-locales";

import { PawsCopyProvider } from "./_i18n/paws-copy-provider";
import { PawsRoom } from "./_room/paws-room";
import { PawsSessionProvider } from "./_session/paws-session-provider";

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
