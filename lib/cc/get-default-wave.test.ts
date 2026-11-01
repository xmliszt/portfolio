import assert from "node:assert/strict";
import { test } from "node:test";

import { getDefaultWave } from "./get-default-wave";

function buildAssets(files: string[]) {
  return files.map((file) => ({ file, alt: "" }));
}

test("puts a promo video in wave 1", () => {
  assert.equal(
    getDefaultWave(
      buildAssets(["video/paws-promo-9x16.mp4", "social/cover-9x16-en.png"])
    ),
    1
  );
});

test("puts any other video in wave 2", () => {
  assert.equal(
    getDefaultWave(buildAssets(["video/paws-features-16x9.mp4"])),
    2
  );
});

test("puts images only in wave 3", () => {
  assert.equal(getDefaultWave(buildAssets(["social/x-1-fingertip.png"])), 3);
});

test("leaves a post without media unwaved", () => {
  assert.equal(getDefaultWave([]), undefined);
  assert.equal(
    getDefaultWave(buildAssets(["video/captions-en.srt"])),
    undefined
  );
});
