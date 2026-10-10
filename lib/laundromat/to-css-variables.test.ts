import assert from "node:assert/strict";
import { test } from "node:test";

import { toCssVariables } from "./to-css-variables";

test("names each token --lm-<kebab-case key>, digits included", () => {
  assert.equal(
    toCssVariables({ bg: "#0c0d0e", faceTop: "#1b1d1f", wall2: "#101112" }),
    "--lm-bg: #0c0d0e; --lm-face-top: #1b1d1f; --lm-wall-2: #101112;"
  );
});

test("returns an empty string for no tokens", () => {
  assert.equal(toCssVariables({}), "");
});
