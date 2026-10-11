import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveLaundromatLocale } from "./resolve-laundromat-locale";

test("prefers a supported cookie over the browser languages", () => {
  assert.equal(
    resolveLaundromatLocale({ cookieLocale: "ja", acceptLanguage: "fr-FR,fr" }),
    "ja"
  );
});

test("ignores an unsupported cookie", () => {
  assert.equal(
    resolveLaundromatLocale({ cookieLocale: "xx", acceptLanguage: "fr-FR" }),
    "fr"
  );
});

test("picks the highest-weighted supported language", () => {
  assert.equal(
    resolveLaundromatLocale({
      cookieLocale: undefined,
      acceptLanguage: "sw;q=0.9, de;q=0.5, ko;q=0.7",
    }),
    "ko"
  );
});

test("maps Chinese regions and scripts to simplified or traditional", () => {
  const cases = [
    ["zh-TW", "zh-Hant"],
    ["zh-HK", "zh-Hant"],
    ["zh-Hant-TW", "zh-Hant"],
    ["zh-CN", "zh-Hans"],
    ["zh", "zh-Hans"],
    ["zh-SG", "zh-Hans"],
  ];
  for (const [header, expected] of cases) {
    assert.equal(
      resolveLaundromatLocale({
        cookieLocale: undefined,
        acceptLanguage: header,
      }),
      expected,
      header
    );
  }
});

test("falls back from a regional tag to its language", () => {
  assert.equal(
    resolveLaundromatLocale({
      cookieLocale: undefined,
      acceptLanguage: "pt-PT",
    }),
    "pt-BR"
  );
  assert.equal(
    resolveLaundromatLocale({
      cookieLocale: undefined,
      acceptLanguage: "en-GB",
    }),
    "en"
  );
});

test("falls back to English when nothing matches", () => {
  assert.equal(
    resolveLaundromatLocale({
      cookieLocale: undefined,
      acceptLanguage: "sw, *",
    }),
    "en"
  );
  assert.equal(
    resolveLaundromatLocale({
      cookieLocale: undefined,
      acceptLanguage: undefined,
    }),
    "en"
  );
});
