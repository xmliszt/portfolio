import assert from "node:assert/strict";
import { test } from "node:test";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";

import { getShareImageUrl } from "./get-share-image-url";

test("points every locale but Hindi at the share image drawn in its language", () => {
  assert.deepEqual(
    LAUNDROMAT_LOCALES.map((locale) => getShareImageUrl(locale)),
    LAUNDROMAT_LOCALES.map((locale) =>
      locale === "hi"
        ? `${LAUNDROMAT_ORIGIN}/laundromat/og.png`
        : `${LAUNDROMAT_ORIGIN}/laundromat/share-image/${locale}.png`
    )
  );
});
