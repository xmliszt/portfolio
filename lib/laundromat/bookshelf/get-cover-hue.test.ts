import assert from "node:assert/strict";
import { test } from "node:test";

import { getCoverHue } from "./get-cover-hue";

test("getCoverHue gives the same hue for the same text and stays within 0 to 359", () => {
  assert.equal(
    getCoverHue("Small Things Like TheseClaire Keegan"),
    getCoverHue("Small Things Like TheseClaire Keegan")
  );
  assert.notEqual(getCoverHue("Piranesi"), getCoverHue("Stoner"));
  for (const text of [
    "",
    "活着余华",
    "موسم الهجرة إلى الشمال",
    "a".repeat(500),
  ]) {
    const hue = getCoverHue(text);
    assert.ok(Number.isInteger(hue) && hue >= 0 && hue < 360, text);
  }
});
