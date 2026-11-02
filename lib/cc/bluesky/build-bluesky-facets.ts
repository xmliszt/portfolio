export type BlueskyFacet = {
  index: { byteStart: number; byteEnd: number };
  features: (
    | { $type: "app.bsky.richtext.facet#link"; uri: string }
    | { $type: "app.bsky.richtext.facet#tag"; tag: string }
  )[];
};

const LINK_PATTERN = /https?:\/\/[^\s]+[^\s.,;:!?)\]"'”’]/g;
const TAG_PATTERN = /(^|\s)#([^\s#.,;:!?)\]"'”’]+)/gu;

const encoder = new TextEncoder();

function toByteIndex(text: string, index: number) {
  return encoder.encode(text.slice(0, index)).length;
}

/** Return the link and hashtag facets of `text`, with UTF-8 byte ranges as Bluesky expects, so they become clickable. */
export function buildBlueskyFacets(text: string): BlueskyFacet[] {
  const links = Array.from(
    text.matchAll(LINK_PATTERN),
    (match): BlueskyFacet => ({
      index: {
        byteStart: toByteIndex(text, match.index ?? 0),
        byteEnd: toByteIndex(text, (match.index ?? 0) + match[0].length),
      },
      features: [{ $type: "app.bsky.richtext.facet#link", uri: match[0] }],
    })
  );
  const tags = Array.from(text.matchAll(TAG_PATTERN), (match): BlueskyFacet => {
    const start = (match.index ?? 0) + match[1].length;
    return {
      index: {
        byteStart: toByteIndex(text, start),
        byteEnd: toByteIndex(text, start + 1 + match[2].length),
      },
      features: [{ $type: "app.bsky.richtext.facet#tag", tag: match[2] }],
    };
  });
  return [...links, ...tags].toSorted(
    (a, b) => a.index.byteStart - b.index.byteStart
  );
}
