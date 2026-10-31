"use client";

import { useEffect, useState } from "react";

import { getPawsCopy } from "@/lib/paws/i18n/get-paws-copy";
import type { PawsLocale } from "@/lib/paws/i18n/paws-locales";
import { PAWS_LOCALE_COOKIE } from "@/lib/paws/i18n/paws-locales";

import { PawsCopyContext } from "./paws-copy-context";

const LOCALE_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

type PawsCopyProviderProps = {
  locale: PawsLocale;
  children: React.ReactNode;
};

/** Provide the copy for `locale`, switchable in place, and mark the subtree and the document with its `lang`. */
export function PawsCopyProvider(props: PawsCopyProviderProps) {
  const [locale, setLocaleState] = useState(props.locale);

  useEffect(() => {
    const root = document.documentElement;
    const originalLang = root.lang;
    root.lang = locale;
    return () => {
      root.lang = originalLang;
    };
  }, [locale]);

  function setLocale(next: PawsLocale) {
    document.cookie = `${PAWS_LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_S}; samesite=lax`;
    setLocaleState(next);
  }

  return (
    <PawsCopyContext.Provider value={{ copy: getPawsCopy(locale), setLocale }}>
      <div lang={locale} className="contents">
        {props.children}
      </div>
    </PawsCopyContext.Provider>
  );
}
