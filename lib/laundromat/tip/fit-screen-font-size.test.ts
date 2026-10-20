import assert from "node:assert/strict";
import { test } from "node:test";

import { fitScreenFontSize } from "./fit-screen-font-size";

test("keeps short words at the largest size and shrinks long or wide ones to fit", () => {
  assert.equal(
    fitScreenFontSize({ text: "TIPS", width: 20, maxFontSize: 5.5 }),
    5.5
  );
  assert.equal(
    fitScreenFontSize({ text: "TEŞEKKÜR", width: 24, maxFontSize: 5.5 }),
    5
  );
  assert.equal(
    fitScreenFontSize({ text: "ありがとう", width: 20, maxFontSize: 5.5 }),
    4
  );
});
