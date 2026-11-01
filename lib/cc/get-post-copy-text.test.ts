import assert from "node:assert/strict";
import { test } from "node:test";

import { getPostCopyText } from "./get-post-copy-text";

test("returns the body alone when there are no hashtags", () => {
  assert.equal(getPostCopyText({ body: "Hello", hashtags: [] }), "Hello");
});

test("appends the hashtags after a blank line", () => {
  assert.equal(
    getPostCopyText({ body: "Hello\n", hashtags: ["cats", "#riso"] }),
    "Hello\n\n#cats #riso"
  );
});
