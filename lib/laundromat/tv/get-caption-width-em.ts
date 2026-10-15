const LATIN_ADVANCE_EM = 0.6;
const WIDE_ADVANCE_EM = 1;
const WIDE_CHARACTER = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;

/** Return the width of `text` set in the monospace caption font, in ems. */
export function getCaptionWidthEm(text: string) {
  return [...text].reduce(
    (total, character) =>
      total +
      (WIDE_CHARACTER.test(character) ? WIDE_ADVANCE_EM : LATIN_ADVANCE_EM),
    0
  );
}
