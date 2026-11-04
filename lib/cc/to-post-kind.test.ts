import assert from "node:assert/strict";
import { test } from "node:test";

import { toPostKind } from "./to-post-kind";

test("saves replies as replies and quotes and reposts as reposts", () => {
  assert.deepEqual(toPostKind("post"), { kind: "post", repost_as: "post" });
  assert.deepEqual(toPostKind("reply"), { kind: "reply", repost_as: "post" });
  assert.deepEqual(toPostKind("quote"), { kind: "repost", repost_as: "quote" });
  assert.deepEqual(toPostKind("repost"), {
    kind: "repost",
    repost_as: "repost",
  });
});
