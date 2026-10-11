"use client";

import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";
import { parseLaundromatLocale } from "@/lib/laundromat/i18n/parse-laundromat-locale";

import { useLaundromatCopy } from "./use-laundromat-copy";

/** Let the visitor switch the laundromat's language, each option named in its own language. */
export function LanguagePicker() {
  const { copy, setLocale } = useLaundromatCopy();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = parseLaundromatLocale(event.target.value);
    if (locale !== undefined) setLocale(locale);
  }

  return (
    <label className="relative flex cursor-pointer items-center gap-x-1.5 px-1.5 py-2 text-[11px] text-[var(--lm-line)] transition-colors duration-200 focus-within:outline-1 focus-within:outline-[var(--lm-line)] focus-within:outline-dashed hover:text-[var(--lm-ink)]">
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="size-3 fill-none stroke-current"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="6" r="4.5" />
        <path d="M1.5 6h9M6 1.5c-1.6 1.4-1.6 7.6 0 9M6 1.5c1.6 1.4 1.6 7.6 0 9" />
      </svg>
      <span aria-hidden>{copy.languageName}</span>
      <select
        aria-label={copy.toolbar.language}
        value={copy.locale}
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LAUNDROMAT_LOCALES.map((locale) => (
          <option key={locale} value={locale} lang={locale}>
            {getLaundromatCopy(locale).languageName}
          </option>
        ))}
      </select>
    </label>
  );
}
