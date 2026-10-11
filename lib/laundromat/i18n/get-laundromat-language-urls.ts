import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";

import { getLaundromatLocaleUrl } from "./get-laundromat-locale-url";
import { LAUNDROMAT_LOCALES } from "./laundromat-locales";

/** Return each locale's page URL keyed by locale, plus the bare origin as `x-default`. */
export function getLaundromatLanguageUrls() {
  return {
    ...Object.fromEntries(
      LAUNDROMAT_LOCALES.map((locale) => [
        locale,
        getLaundromatLocaleUrl(locale),
      ])
    ),
    "x-default": LAUNDROMAT_ORIGIN,
  };
}
