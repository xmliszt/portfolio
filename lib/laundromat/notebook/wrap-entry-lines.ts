const TOKEN_PATTERN =
  /\s+|[　-ヿ㐀-䶿一-鿿가-힯豈-﫿＀-￯]|[^\s　-ヿ㐀-䶿一-鿿가-힯豈-﫿＀-￯]+/g;

export type WrappedLine = { text: string; start: number };

type WrapEntryLinesOptions = {
  text: string;
  maxWidthPx: number;
  measure: (text: string) => number;
};

type WrapState = { lines: WrappedLine[]; line: string; start: number };

function splitGraphemes(text: string) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return Array.from(segmenter.segment(text), ({ segment }) => segment);
}

function breakToken(options: WrapEntryLinesOptions & { start: number }) {
  return splitGraphemes(options.text).reduce<WrapState & { at: number }>(
    (state, grapheme) => {
      const candidate = state.line + grapheme;
      const at = state.at + grapheme.length;
      if (
        state.line === "" ||
        options.measure(candidate) <= options.maxWidthPx
      ) {
        return { ...state, line: candidate, at };
      }
      return {
        lines: [...state.lines, { text: state.line, start: state.start }],
        line: grapheme,
        start: state.at,
        at,
      };
    },
    { lines: [], line: "", start: options.start, at: options.start }
  );
}

function wrapParagraph(options: WrapEntryLinesOptions & { start: number }) {
  const tokens = Array.from(options.text.matchAll(TOKEN_PATTERN));
  const wrapped = tokens.reduce<WrapState>(
    (state, match) => {
      const token = match[0];
      const at = options.start + (match.index ?? 0);
      const isSpace = /^\s+$/.test(token);
      const candidate = state.line + token;
      if (options.measure(candidate.trimEnd()) <= options.maxWidthPx) {
        return {
          lines: state.lines,
          line: candidate,
          start: state.line === "" ? at : state.start,
        };
      }
      if (isSpace) {
        return {
          lines: [...state.lines, { text: state.line, start: state.start }],
          line: "",
          start: at + token.length,
        };
      }
      const lines =
        state.line === ""
          ? state.lines
          : [...state.lines, { text: state.line, start: state.start }];
      if (options.measure(token) > options.maxWidthPx) {
        const broken = breakToken({ ...options, text: token, start: at });
        return {
          lines: [...lines, ...broken.lines],
          line: broken.line,
          start: broken.start,
        };
      }
      return { lines, line: token, start: at };
    },
    { lines: [], line: "", start: options.start }
  );
  return [...wrapped.lines, { text: wrapped.line, start: wrapped.start }].map(
    (line) => ({ ...line, text: line.text.trimEnd() })
  );
}

/** Return the lines `text` occupies, each with its `start` offset in `text`, when each line is at most `maxWidthPx` wide by `measure`, breaking at spaces and between CJK characters, and inside a word only when it is wider than a line. */
export function wrapEntryLines(options: WrapEntryLinesOptions) {
  return options.text.split("\n").reduce<{ lines: WrappedLine[]; at: number }>(
    (state, paragraph) => ({
      lines: [
        ...state.lines,
        ...wrapParagraph({ ...options, text: paragraph, start: state.at }),
      ],
      at: state.at + paragraph.length + 1,
    }),
    { lines: [], at: 0 }
  ).lines;
}
