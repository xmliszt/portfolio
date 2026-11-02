import assert from "node:assert/strict";
import { test } from "node:test";

import { buildBlueskyFacets } from "./build-bluesky-facets";

function readFacets(text: string) {
  const bytes = new TextEncoder().encode(text);
  return buildBlueskyFacets(text).map((facet) => ({
    text: new TextDecoder().decode(
      bytes.slice(facet.index.byteStart, facet.index.byteEnd)
    ),
    feature: facet.features.at(0),
  }));
}

test("marks links and hashtags with UTF-8 byte ranges", () => {
  assert.deepEqual(readFacets("猫 visit https://paws.garden. #digitalart"), [
    {
      text: "https://paws.garden",
      feature: {
        $type: "app.bsky.richtext.facet#link",
        uri: "https://paws.garden",
      },
    },
    {
      text: "#digitalart",
      feature: { $type: "app.bsky.richtext.facet#tag", tag: "digitalart" },
    },
  ]);
});

test("ends a link at Chinese text and full-width punctuation", () => {
  assert.deepEqual(
    readFacets("看看https://paws.garden，很可爱").map((facet) => facet.text),
    ["https://paws.garden"]
  );
  assert.deepEqual(
    readFacets("（https://paws.garden）").map((facet) => facet.text),
    ["https://paws.garden"]
  );
  assert.deepEqual(
    readFacets("来 https://paws.garden。 #猫").map((facet) => facet.text),
    ["https://paws.garden", "#猫"]
  );
});

test("keeps balanced parentheses in a link and drops a stray closing one", () => {
  assert.deepEqual(
    readFacets("see https://en.wikipedia.org/wiki/Cat_(disambiguation)").map(
      (facet) => facet.text
    ),
    ["https://en.wikipedia.org/wiki/Cat_(disambiguation)"]
  );
  assert.deepEqual(
    readFacets("(see https://paws.garden)").map((facet) => facet.text),
    ["https://paws.garden"]
  );
});

test("skips tags that are numbers only, too long, or inside words", () => {
  assert.deepEqual(readFacets(`#2026 #${"a".repeat(65)} issue#12 C# code`), []);
});
