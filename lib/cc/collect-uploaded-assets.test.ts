import assert from "node:assert/strict";
import { test } from "node:test";

import { collectUploadedAssets } from "./collect-uploaded-assets";

test("lists each uploaded path once and skips name-only assets", () => {
  assert.deepEqual(
    collectUploadedAssets([
      [
        { file: "promo.mp4", alt: "A cat", path: "media/aa/promo.mp4" },
        { file: "draft.mp4", alt: "" },
      ],
      [
        { file: "promo copy.mp4", alt: "", path: "media/aa/promo.mp4" },
        { file: "shot.png", alt: "", path: "c/uploads/1/shot.png" },
      ],
      "not a list",
    ]),
    [
      { file: "promo.mp4", path: "media/aa/promo.mp4" },
      { file: "shot.png", path: "c/uploads/1/shot.png" },
    ]
  );
});
