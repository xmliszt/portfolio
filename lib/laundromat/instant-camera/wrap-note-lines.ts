function splitBy(options: { text: string; granularity: "word" | "grapheme" }) {
  return [
    ...new Intl.Segmenter(undefined, {
      granularity: options.granularity,
    }).segment(options.text),
  ].map(({ segment }) => segment);
}

/** Return `text` broken into lines no wider than `maxWidth` by `measure`, breaking between words where it can and between characters inside a word wider than a line. */
export function wrapNoteLines(options: {
  text: string;
  maxWidth: number;
  measure: (text: string) => number;
}) {
  const { maxWidth, measure } = options;
  function fits(text: string) {
    return measure(text) <= maxWidth;
  }
  const pieces = splitBy({
    text: options.text.trim(),
    granularity: "word",
  }).flatMap((word) =>
    fits(word.trim())
      ? [word]
      : splitBy({ text: word, granularity: "grapheme" }).reduce<string[]>(
          (chunks, grapheme) => {
            const last = chunks.at(-1);
            return last !== undefined && fits(last + grapheme)
              ? [...chunks.slice(0, -1), last + grapheme]
              : [...chunks, grapheme];
          },
          []
        )
  );
  return pieces
    .reduce<string[]>((lines, piece) => {
      const current = lines.at(-1);
      return current !== undefined && fits(current + piece)
        ? [...lines.slice(0, -1), current + piece]
        : [...lines, piece.trimStart()];
    }, [])
    .map((line) => line.trimEnd())
    .filter((line) => line !== "");
}
