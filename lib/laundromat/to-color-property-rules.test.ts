import assert from "node:assert/strict";
import { test } from "node:test";

import { toColorPropertyRules } from "./to-color-property-rules";

test("registers each token as an inherited colour starting at its value", () => {
  assert.equal(
    toColorPropertyRules({ faceTop: "#1b1d1f", wall2: "#101112" }),
    [
      '@property --lm-face-top { syntax: "<color>"; inherits: true; initial-value: #1b1d1f; }',
      '@property --lm-wall-2 { syntax: "<color>"; inherits: true; initial-value: #101112; }',
    ].join("\n")
  );
});
