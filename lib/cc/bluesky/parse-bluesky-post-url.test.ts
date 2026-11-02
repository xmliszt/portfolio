import assert from "node:assert/strict";
import { test } from "node:test";

import { parseBlueskyPostUrl } from "./parse-bluesky-post-url";

test("reads the account and record key from a post link", () => {
  assert.deepEqual(
    parseBlueskyPostUrl("https://bsky.app/profile/did:plc:abc/post/3k2la"),
    { actor: "did:plc:abc", recordKey: "3k2la" }
  );
  assert.deepEqual(
    parseBlueskyPostUrl(
      "https://bsky.app/profile/xmliszt.bsky.social/post/3k2la?ref=x"
    ),
    { actor: "xmliszt.bsky.social", recordKey: "3k2la" }
  );
  assert.equal(
    parseBlueskyPostUrl("https://bsky.app/profile/xmliszt.bsky.social"),
    undefined
  );
});
