import { wrapEntryText } from "./wrap-entry-text";

const ELLIPSIS = "…";

/** Return the largest font size from `baseFontSizePx` down to `baseFontSizePx * minScale` at which `text` wraps into at most `rowCount` lines, with those lines; when even the smallest size needs more rows, return its first `rowCount` lines with the last one cut to end in "…". */
export function fitTranslatedLines(options: {
  text: string;
  rowCount: number;
  maxWidthPx: number;
  baseFontSizePx: number;
  minScale: number;
  measureAt: (fontSizePx: number) => (text: string) => number;
}) {
  const minFontSizePx = Math.ceil(options.baseFontSizePx * options.minScale);
  const sizes = Array.from(
    { length: Math.max(1, options.baseFontSizePx - minFontSizePx + 1) },
    (_, index) => options.baseFontSizePx - index
  );
  for (const fontSizePx of sizes) {
    const lines = wrapEntryText({
      text: options.text,
      maxWidthPx: options.maxWidthPx,
      measure: options.measureAt(fontSizePx),
    });
    if (lines.length <= options.rowCount) {
      return { fontSizePx, lines, isTruncated: false };
    }
  }
  const fontSizePx = sizes.at(-1) ?? options.baseFontSizePx;
  const measure = options.measureAt(fontSizePx);
  const kept = wrapEntryText({
    text: options.text,
    maxWidthPx: options.maxWidthPx,
    measure,
  }).slice(0, Math.max(1, options.rowCount));
  const last = Array.from(kept.at(-1) ?? "");
  while (
    last.length > 0 &&
    measure(`${last.join("").trimEnd()}${ELLIPSIS}`) > options.maxWidthPx
  ) {
    last.pop();
  }
  return {
    fontSizePx,
    lines: [...kept.slice(0, -1), `${last.join("").trimEnd()}${ELLIPSIS}`],
    isTruncated: true,
  };
}
