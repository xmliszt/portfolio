import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

/** Return the page label of `spread` in a notebook of `pageCount` pages: `inside cover · p. 1`, `pp. 2–3`, or `p. 48` when only one side is a page. */
export function describeSpread(options: {
  spread: number;
  pageCount: number;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.notebook;
  const left = options.spread * 2;
  const right = left + 1;
  const hasLeft = left >= 1 && left <= options.pageCount;
  const hasRight = right <= options.pageCount;
  if (!hasLeft) {
    return hasRight
      ? copy.insideCoverAndPage({ page: right })
      : copy.insideCover;
  }
  return hasRight ? copy.pages({ left, right }) : copy.page({ page: left });
}
