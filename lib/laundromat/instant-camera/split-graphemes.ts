/** Return `text` split into the characters a reader sees, keeping emoji, accents and joined sequences whole. */
export function splitGraphemes(text: string) {
  return [
    ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
  ].map(({ segment }) => segment);
}
