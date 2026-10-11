import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";

import type { LaundromatLocale } from "./laundromat-locales";

/** Return the page URL of `locale`. */
export function getLaundromatLocaleUrl(locale: LaundromatLocale) {
  return `${LAUNDROMAT_ORIGIN}/${locale}`;
}
