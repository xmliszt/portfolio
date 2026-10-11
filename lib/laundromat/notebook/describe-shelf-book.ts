import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import { formatEntryDay } from "./format-entry-day";

type DescribeShelfBookOptions = {
  number: number;
  startedAtMs: number;
  filledAtMs: number;
  entryCount: number;
  copy: LaundromatCopy;
};

/** Return the shelf book's hit target `label` and its `tooltip`, `mar 30 – may 11 · 2026 · 301 entries`. */
export function describeShelfBook(options: DescribeShelfBookOptions) {
  const { copy } = options;
  const span = copy.notebook.daySpan({
    from: formatEntryDay({
      timestampMs: options.startedAtMs,
      locale: copy.locale,
    }),
    to: formatEntryDay({
      timestampMs: options.filledAtMs,
      locale: copy.locale,
    }),
  });
  const startYear = new Date(options.startedAtMs).getFullYear();
  const endYear = new Date(options.filledAtMs).getFullYear();
  const years =
    startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
  const entries = copy.shelf.entryCount({ count: options.entryCount });
  return {
    label: copy.shelf.bookLabel({
      number: options.number,
      span: `${span}, ${years}`,
      entries,
    }),
    tooltip: `${span} · ${years} · ${entries}`,
  };
}
