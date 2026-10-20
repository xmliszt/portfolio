const WIDE_CHARACTER = /[ᄀ-ᇿ⺀-鿿가-힯豈-﫿＀-￯]/u;
const NARROW_EM = 0.6;

/** Return the font size, at most `maxFontSize`, at which `text` in a monospace face fits `width`, counting CJK and Hangul characters as a full em and others as `NARROW_EM`. */
export function fitScreenFontSize(options: {
  text: string;
  width: number;
  maxFontSize: number;
}) {
  const ems = [...options.text].reduce(
    (total, character) =>
      total + (WIDE_CHARACTER.test(character) ? 1 : NARROW_EM),
    0
  );
  return ems === 0
    ? options.maxFontSize
    : Math.min(options.maxFontSize, options.width / ems);
}
