import assert from "node:assert/strict";
import { test } from "node:test";

import { getMediaType } from "./get-media-type";

test("reads the kind and MIME type from the extension, ignoring case", () => {
  assert.deepEqual(getMediaType("c/uploads/1/Shot.PNG"), {
    kind: "image",
    mimeType: "image/png",
  });
  assert.deepEqual(getMediaType("film.mp4"), {
    kind: "video",
    mimeType: "video/mp4",
  });
  assert.deepEqual(getMediaType("loop.gif"), {
    kind: "gif",
    mimeType: "image/gif",
  });
});

test("returns undefined for files it cannot send", () => {
  assert.equal(getMediaType("notes.pdf"), undefined);
  assert.equal(getMediaType("no-extension"), undefined);
});
