const TOKEN_PATTERN =
  /\s+|[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]|[^\s\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]+/g;

type WrapEntryTextOptions = {
  text: string;
  maxWidthPx: number;
  measure: (text: string) => number;
};

type WrapState = { lines: string[]; line: string };

const EMPTY_WRAP: WrapState = { lines: [], line: "" };

function splitGraphemes(text: string) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return Array.from(segmenter.segment(text), ({ segment }) => segment);
}

function breakToken(options: WrapEntryTextOptions) {
  return splitGraphemes(options.text).reduce<WrapState>(
    (state, grapheme) => {
      const candidate = state.line + grapheme;
      if (state.line === "" || options.measure(candidate) <= options.maxWidthPx) {
        return { lines: state.lines, line: candidate };
      }
      return { lines: [...state.lines, state.line], line: grapheme };
    },
    EMPTY_WRAP
  );
}

function wrapParagraph(options: WrapEntryTextOptions) {
  const tokens = options.text.match(TOKEN_PATTERN) ?? [];
  const wrapped = tokens.reduce<WrapState>(
    (state, token) => {
      const isSpace = /^\s+$/.test(token);
      const candidate = state.line + token;
      if (options.measure(candidate.trimEnd()) <= options.maxWidthPx) {
        return { lines: state.lines, line: candidate };
      }
      if (isSpace) return { lines: [...state.lines, state.line], line: "" };
      const lines = state.line === "" ? state.lines : [...state.lines, state.line];
      if (options.measure(token) > options.maxWidthPx) {
        const broken = breakToken({ ...options, text: token });
        return { lines: [...lines, ...broken.lines], line: broken.line };
      }
      return { lines, line: token };
    },
    EMPTY_WRAP
  );
  return [...wrapped.lines, wrapped.line].map((line) => line.trimEnd());
}

/** Return the lines `text` occupies when each line is at most `maxWidthPx` wide by `measure`, breaking at spaces and between CJK characters, and inside a word only when it is wider than a line. */
export function wrapEntryText(options: WrapEntryTextOptions) {
  return options.text
    .split("\n")
    .flatMap((paragraph) => wrapParagraph({ ...options, text: paragraph }));
}
