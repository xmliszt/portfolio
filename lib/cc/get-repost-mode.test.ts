import assert from "node:assert/strict";
import { test } from "node:test";

import { getRepostMode } from "./get-repost-mode";

test("uses repost_as only for repost rows", () => {
  assert.equal(getRepostMode({ kind: "repost", repost_as: "quote" }), "quote");
  assert.equal(
    getRepostMode({ kind: "repost", repost_as: "repost" }),
    "repost"
  );
  assert.equal(getRepostMode({ kind: "post", repost_as: "repost" }), "post");
  assert.equal(getRepostMode({ kind: "repost", repost_as: "other" }), "post");
});
