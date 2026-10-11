import assert from "node:assert/strict";
import { test } from "node:test";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";

import { getLaundromatLanguageUrls } from "./get-laundromat-language-urls";
import { LAUNDROMAT_LOCALES } from "./laundromat-locales";

test("lists every locale's page and the bare origin as x-default", () => {
  assert.deepEqual(getLaundromatLanguageUrls(), {
    ...Object.fromEntries(
      LAUNDROMAT_LOCALES.map((locale) => [
        locale,
        `${LAUNDROMAT_ORIGIN}/${locale}`,
      ])
    ),
    "x-default": LAUNDROMAT_ORIGIN,
  });
});
