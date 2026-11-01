/** Return the tags in `text`, split on spaces and commas, without their leading `#`. */
export function parseHashtags(text: string) {
  return text
    .split(/[\s,，]+/u)
    .map((tag) => tag.replace(/^#+/, ""))
    .filter((tag) => tag !== "");
}
