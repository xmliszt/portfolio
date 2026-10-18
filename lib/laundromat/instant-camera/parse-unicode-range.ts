/** Return the code point ranges in a CSS `unicode-range` value such as `"U+0000-00FF, U+0131, U+4E??"`, skipping parts it cannot read. */
export function parseUnicodeRange(value: string) {
  return value
    .split(",")
    .map((part) => part.trim().toUpperCase().replace(/^U\+/, ""))
    .flatMap((part) => {
      const [from, to] = part.includes("?")
        ? [part.replaceAll("?", "0"), part.replaceAll("?", "F")]
        : part.split("-");
      const start = Number.parseInt(from ?? "", 16);
      const end = Number.parseInt(to ?? from ?? "", 16);
      return Number.isNaN(start) || Number.isNaN(end)
        ? []
        : [{ from: start, to: end }];
    });
}
