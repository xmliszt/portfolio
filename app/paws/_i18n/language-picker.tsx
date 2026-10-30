"use client";

import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { parseLaundromatLocale } from "@/lib/laundromat/i18n/parse-laundromat-locale";
import { getPawsCopy } from "@/lib/paws/i18n/get-paws-copy";
import { PAWS_LOCALES } from "@/lib/paws/i18n/paws-locales";
import { cn } from "@/lib/utils";

import { usePawsCopy } from "./use-paws-copy";

/** Let the visitor switch the Paws language from a native menu, each option named in its own language. */
export function LanguagePicker() {
  const { copy, setLocale } = usePawsCopy();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = parseLaundromatLocale(event.target.value);
    if (locale !== undefined) setLocale(locale);
  }

  return (
    <select
      aria-label={copy.room.language}
      value={copy.locale}
      onChange={handleChange}
      className={cn(
        FOCUS_RING_CLASS,
        "h-10 max-w-36 cursor-pointer appearance-none border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
      )}
    >
      {PAWS_LOCALES.map((locale) => (
        <option key={locale} value={locale}>
          {getPawsCopy(locale).languageName}
        </option>
      ))}
    </select>
  );
}
