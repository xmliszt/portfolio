/** Return `lines` with the spaces and tabs that end `text` added back to its last line, unless that line would then be wider than `maxWidthPx`. */
export function keepTrailingSpace(options: {
  lines: string[];
  text: string;
  maxWidthPx: number;
  measure: (text: string) => number;
}) {
  const trailing = /[^\S\n]*$/u.exec(options.text)?.[0] ?? "";
  const last = options.lines.at(-1);
  if (trailing === "" || last === undefined) return options.lines;
  const widened = last + trailing;
  if (options.measure(widened) > options.maxWidthPx) return options.lines;
  return [...options.lines.slice(0, -1), widened];
}
