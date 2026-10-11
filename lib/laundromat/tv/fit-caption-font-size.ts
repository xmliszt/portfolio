const LATIN_ADVANCE_EM = 0.6;
const WIDE_ADVANCE_EM = 1;
const WIDE_CHARACTER = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;

/** Return the largest font size up to `maxFontSize` at which `text`, set in the monospace caption font, fits in `maxWidth`. */
export function fitCaptionFontSize(options: {
  text: string;
  maxWidth: number;
  maxFontSize: number;
}) {
  const widthEm = [...options.text].reduce(
    (total, character) =>
      total +
      (WIDE_CHARACTER.test(character) ? WIDE_ADVANCE_EM : LATIN_ADVANCE_EM),
    0
  );
  return widthEm === 0
    ? options.maxFontSize
    : Math.min(options.maxFontSize, options.maxWidth / widthEm);
}
