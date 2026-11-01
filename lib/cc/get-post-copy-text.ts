/** Return the text to paste for a post: `body`, then a blank line and the `hashtags` as `#tag` words when there are any. */
export function getPostCopyText(options: {
  body: string;
  hashtags: readonly string[];
}) {
  if (options.hashtags.length === 0) {
    return options.body;
  }
  const tags = options.hashtags.map((tag) => `#${tag.replace(/^#/, "")}`);
  return `${options.body.trimEnd()}\n\n${tags.join(" ")}`;
}
