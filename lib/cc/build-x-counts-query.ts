/** Return the X search query that counts posts with `term`: in quotes when it has more than one word, with reposts left out. */
export function buildXCountsQuery(term: string) {
  const words = term.replaceAll('"', "").trim().split(/\s+/u);
  const phrase = words.length > 1 ? `"${words.join(" ")}"` : words.join("");
  return `${phrase} -is:retweet`;
}
