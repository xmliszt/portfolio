import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

import { formatEntryDate } from "./format-entry-date";

type DescribeEntryMetaOptions = {
  signOff: string | null;
  createdAtMs: number;
  locale: LaundromatLocale;
};

/** Return an entry's muted last line: `— <signOff> · oct 8 · 2:14 a.m.`, or only the date when there is no sign-off. */
export function describeEntryMeta(options: DescribeEntryMetaOptions) {
  const date = formatEntryDate({
    timestampMs: options.createdAtMs,
    locale: options.locale,
  });
  return options.signOff === null ? date : `— ${options.signOff} · ${date}`;
}
