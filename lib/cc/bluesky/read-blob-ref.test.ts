import assert from "node:assert/strict";
import { test } from "node:test";

import { readBlobRef } from "./read-blob-ref";

const blob = {
  $type: "blob",
  ref: { $link: "bafk" },
  mimeType: "video/mp4",
  size: 10,
};

test("reads the blob from a body or its job status", () => {
  assert.deepEqual(readBlobRef({ blob }), blob);
  assert.deepEqual(
    readBlobRef({ jobStatus: { state: "JOB_STATE_FAILED", blob } }),
    blob
  );
});

test("returns undefined when there is no blob reference", () => {
  assert.equal(readBlobRef({ error: "already_exists" }), undefined);
  assert.equal(
    readBlobRef({ jobStatus: { state: "JOB_STATE_ENCODING" } }),
    undefined
  );
  assert.equal(readBlobRef(undefined), undefined);
});
