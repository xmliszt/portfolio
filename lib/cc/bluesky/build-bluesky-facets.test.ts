import assert from "node:assert/strict";
import { test } from "node:test";

import { buildBlueskyFacets } from "./build-bluesky-facets";

test("marks links and hashtags with UTF-8 byte ranges", () => {
  const text = "猫 visit https://paws.garden. #digitalart";
  const facets = buildBlueskyFacets(text);
  const bytes = new TextEncoder().encode(text);
  const decode = (start: number, end: number) =>
    new TextDecoder().decode(bytes.slice(start, end));
  assert.equal(facets.length, 2);
  const [link, tag] = facets;
  assert.equal(
    decode(link.index.byteStart, link.index.byteEnd),
    "https://paws.garden"
  );
  assert.deepEqual(link.features, [
    { $type: "app.bsky.richtext.facet#link", uri: "https://paws.garden" },
  ]);
  assert.equal(decode(tag.index.byteStart, tag.index.byteEnd), "#digitalart");
  assert.deepEqual(tag.features, [
    { $type: "app.bsky.richtext.facet#tag", tag: "digitalart" },
  ]);
});

test("ignores # inside words and returns nothing for plain text", () => {
  assert.deepEqual(buildBlueskyFacets("issue#12 and C# code"), []);
  assert.deepEqual(buildBlueskyFacets("just words"), []);
});
