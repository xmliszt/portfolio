import assert from "node:assert/strict";
import { test } from "node:test";

import {
  FINGERPRINT_PATTERNS,
  getFingerprintStyle,
} from "./get-fingerprint-style";

test("each visitor keeps one style, and visitors differ", () => {
  assert.deepEqual(getFingerprintStyle("a"), getFingerprintStyle("a"));
  const styles = Array.from({ length: 40 }, (_, index) =>
    getFingerprintStyle(`user-${index}`)
  );
  assert.ok(new Set(styles.map((style) => style.inks.join())).size > 4);
  assert.ok(new Set(styles.map((style) => style.pattern)).size > 2);
  styles.forEach((style) => {
    assert.ok(style.pattern >= 0 && style.pattern < FINGERPRINT_PATTERNS);
    assert.ok(Math.abs(style.tilt) <= 0.45);
  });
});
