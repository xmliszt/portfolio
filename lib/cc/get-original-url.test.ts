import assert from "node:assert/strict";
import { test } from "node:test";

import { getOriginalUrl } from "./get-original-url";

test("returns a link as it is", () => {
  assert.equal(
    getOriginalUrl({ platform: "x", original_ref: "x.com/a/status/1" }),
    "https://x.com/a/status/1"
  );
});

test("builds a link from an X id or a Bluesky URI", () => {
  assert.equal(
    getOriginalUrl({ platform: "x", original_ref: "123" }),
    "https://x.com/i/web/status/123"
  );
  assert.equal(
    getOriginalUrl({
      platform: "bluesky",
      original_ref: "at://did:plc:abc/app.bsky.feed.post/3k",
    }),
    "https://bsky.app/profile/did:plc:abc/post/3k"
  );
});

test("has no link for a Threads id or an unset ref", () => {
  assert.equal(
    getOriginalUrl({ platform: "threads", original_ref: "1802837" }),
    undefined
  );
  assert.equal(
    getOriginalUrl({ platform: "x", original_ref: null }),
    undefined
  );
});
