import assert from "node:assert/strict";
import { test } from "node:test";

import { parsePostAssets } from "./parse-post-assets";

test("keeps file, alt and an uploaded path, and drops entries without a file", () => {
  assert.deepEqual(
    parsePostAssets([
      { file: "video/a.mp4", alt: "A cat", path: "c1/video/a.mp4" },
      { file: "social/b.png" },
      { alt: "no file" },
      "nope",
    ]),
    [
      { file: "video/a.mp4", alt: "A cat", path: "c1/video/a.mp4" },
      { file: "social/b.png", alt: "" },
    ]
  );
});
