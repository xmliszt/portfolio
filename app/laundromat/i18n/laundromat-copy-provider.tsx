"use client";

import { useEffect, useState } from "react";

import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { LAUNDROMAT_LOCALE_COOKIE } from "@/lib/laundromat/i18n/laundromat-locales";
import { parseLaundromatLocale } from "@/lib/laundromat/i18n/parse-laundromat-locale";

import { LaundromatCopyContext } from "./laundromat-copy-context";

const LOCALE_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

type LaundromatCopyProviderProps = {
  locale: LaundromatLocale;
  children: React.ReactNode;
};

/** Provide the copy for `locale`, switchable in place, and mark the subtree and the document with its `lang`. */
export function LaundromatCopyProvider(props: LaundromatCopyProviderProps) {
  const [locale, setLocaleState] = useState(props.locale);

  useEffect(() => {
    const root = document.documentElement;
    const originalLang = root.lang;
    root.lang = locale;
    return () => {
      root.lang = originalLang;
    };
  }, [locale]);

  function setLocale(next: LaundromatLocale) {
    document.cookie = `${LAUNDROMAT_LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_S}; samesite=lax`;
    const segments = window.location.pathname.split("/");
    if (parseLaundromatLocale(segments.at(-1) ?? "") !== undefined) {
      const pathname = [...segments.slice(0, -1), next].join("/");
      window.history.replaceState(
        window.history.state,
        "",
        `${pathname}${window.location.search}`
      );
    }
    setLocaleState(next);
  }

  return (
    <LaundromatCopyContext.Provider
      value={{ copy: getLaundromatCopy(locale), setLocale }}
    >
      <div lang={locale} className="contents">
        {props.children}
      </div>
    </LaundromatCopyContext.Provider>
  );
}
