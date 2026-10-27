import { parseLaundromatLocale } from "@/lib/laundromat/i18n/parse-laundromat-locale";

import { getReferrerHost } from "./get-referrer-host";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;

/** Return the visit's `visitorId`, supported `locale`, two-letter `country` and `referrerHost` from untrusted input, or `undefined` when the id or locale is malformed; a malformed country or referrer becomes `undefined`. */
export function parseVisitInput(options: {
  visitorId: unknown;
  locale: unknown;
  referrer: unknown;
  countryHeader: string | null;
}) {
  if (typeof options.visitorId !== "string") return undefined;
  if (!UUID_PATTERN.test(options.visitorId)) return undefined;
  if (typeof options.locale !== "string") return undefined;
  const locale = parseLaundromatLocale(options.locale);
  if (locale === undefined) return undefined;
  const country = options.countryHeader ?? "";
  return {
    visitorId: options.visitorId,
    locale,
    country: COUNTRY_PATTERN.test(country) ? country : undefined,
    referrerHost:
      typeof options.referrer === "string"
        ? getReferrerHost(options.referrer)
        : undefined,
  };
}
