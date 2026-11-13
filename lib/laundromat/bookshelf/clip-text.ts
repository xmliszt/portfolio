/** Return `text` trimmed and cut to at most `maxChars` characters, counting each code point once; `undefined` when nothing is left. */
export function clipText(options: {
  text: string | undefined;
  maxChars: number;
}) {
  const trimmed = options.text?.trim();
  if (!trimmed) return undefined;
  return [...trimmed].slice(0, options.maxChars).join("").trim();
}
