import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

import { SHARE_IMAGE_LOCALES } from "./share-image-locales";

/** Return the URL of the link-preview image for `locale`: the one drawn in its language, or the text-free `og.png` when `locale` has none. */
export function getShareImageUrl(locale: LaundromatLocale) {
  return SHARE_IMAGE_LOCALES.some((each) => each === locale)
    ? `${LAUNDROMAT_ORIGIN}/laundromat/share-image/${locale}.png`
    : `${LAUNDROMAT_ORIGIN}/laundromat/og.png`;
}
