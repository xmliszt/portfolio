/** Return `text` with `link` on its own line at the end, or `text` unchanged when it already contains `link`. */
export function appendLink(options: { text: string; link: string }) {
  if (options.text.includes(options.link)) return options.text;
  return options.text.trim() === ""
    ? options.link
    : `${options.text.trimEnd()}\n\n${options.link}`;
}
