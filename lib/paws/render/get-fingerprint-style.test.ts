import assert from "node:assert/strict";
import { test } from "node:test";

import { getFingerprintStyle } from "./get-fingerprint-style";

test("each visitor keeps one fingertip, and visitors differ", () => {
  assert.deepEqual(getFingerprintStyle("a"), getFingerprintStyle("a"));
  const styles = Array.from({ length: 60 }, (_, index) =>
    getFingerprintStyle(`user-${index}`)
  );
  assert.ok(new Set(styles.map((style) => style.inks.join())).size > 4);
  assert.ok(new Set(styles.map((style) => style.skin.base)).size > 4);
  assert.deepEqual(
    new Set(styles.map((style) => style.ridges.kind)),
    new Set(["loop", "whorl", "arch"])
  );
  styles.forEach((style) => {
    assert.ok(style.angle >= -0.95 && style.angle <= 0.25);
    assert.ok(style.scale >= 0.88 && style.scale <= 1.12);
    assert.ok(Math.abs(style.tilt) <= 0.2);
    assert.ok(style.ridges.gap >= 1.3 && style.ridges.gap <= 1.65);
  });
});
