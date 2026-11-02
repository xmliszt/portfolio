export type BlueskyFacet = {
  index: { byteStart: number; byteEnd: number };
  features: (
    | { $type: "app.bsky.richtext.facet#link"; uri: string }
    | { $type: "app.bsky.richtext.facet#tag"; tag: string }
  )[];
};

const LINK_PATTERN =
  /https?:\/\/[^\s\u3000-\u303F\uFF00-\uFFEF\u4E00-\u9FFF]+\.[^\s\u3000-\u303F\uFF00-\uFFEF\u4E00-\u9FFF]+/g;
const TRAILING_PUNCTUATION = /[.,;:!?"'”’\]]+$/;
const TAG_PATTERN = /(^|\s)#([^\s#.,;:!?)\]"'”’　-〿＀-￯]+)/gu;
const MAX_TAG_GRAPHEMES = 64;

const encoder = new TextEncoder();
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function toByteRange(options: { text: string; start: number; length: number }) {
  return {
    byteStart: encoder.encode(options.text.slice(0, options.start)).length,
    byteEnd: encoder.encode(
      options.text.slice(0, options.start + options.length)
    ).length,
  };
}

function trimLink(match: string): string {
  const trimmed = match.replace(TRAILING_PUNCTUATION, "");
  return trimmed.endsWith(")") && !trimmed.includes("(")
    ? trimLink(trimmed.slice(0, -1))
    : trimmed;
}

function isValidTag(tag: string) {
  return (
    /\p{L}/u.test(tag) &&
    Array.from(segmenter.segment(tag)).length <= MAX_TAG_GRAPHEMES
  );
}

/** Return the link and hashtag facets of `text`, with UTF-8 byte ranges as Bluesky expects, so they become clickable; tags with no letter or over 64 graphemes are left as plain text. */
export function buildBlueskyFacets(text: string): BlueskyFacet[] {
  const links = Array.from(
    text.matchAll(LINK_PATTERN),
    (match): BlueskyFacet => {
      const uri = trimLink(match[0]);
      return {
        index: toByteRange({
          text,
          start: match.index ?? 0,
          length: uri.length,
        }),
        features: [{ $type: "app.bsky.richtext.facet#link", uri }],
      };
    }
  );
  const tags = Array.from(text.matchAll(TAG_PATTERN)).flatMap(
    (match): BlueskyFacet[] => {
      const tag = match[2];
      if (!isValidTag(tag)) return [];
      return [
        {
          index: toByteRange({
            text,
            start: (match.index ?? 0) + match[1].length,
            length: tag.length + 1,
          }),
          features: [{ $type: "app.bsky.richtext.facet#tag", tag }],
        },
      ];
    }
  );
  return [...links, ...tags].toSorted(
    (a, b) => a.index.byteStart - b.index.byteStart
  );
}
