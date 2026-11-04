import assert from "node:assert/strict";
import { test } from "node:test";

import { buildMediaPath } from "./build-media-path";

const SHA256 =
  "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

test("puts the cleaned file name under the hash folder", () => {
  assert.deepEqual(
    buildMediaPath({ sha256: SHA256, fileName: "Autumn Sphere (final).mp4" }),
    {
      folder: `media/${SHA256}`,
      path: `media/${SHA256}/Autumn-Sphere-final-.mp4`,
    }
  );
});

test("rejects a hash that is not 64 lowercase hex characters", () => {
  assert.throws(() =>
    buildMediaPath({ sha256: SHA256.toUpperCase(), fileName: "a.png" })
  );
  assert.throws(() => buildMediaPath({ sha256: "../x", fileName: "a.png" }));
});
