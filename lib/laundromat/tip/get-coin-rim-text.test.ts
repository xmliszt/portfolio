import assert from "node:assert/strict";
import { test } from "node:test";

import { getCoinRimText } from "./get-coin-rim-text";

test("repeats the site and thanks until the ring is full", () => {
  assert.equal(
    getCoinRimText({ siteName: "laundro.cafe", thanks: "thank you" }),
    "laundro.cafe · thank you · laundro.cafe · thank you · "
  );
  assert.equal(
    getCoinRimText({ siteName: "laundro.cafe", thanks: "谢谢" }).length >= 54,
    true
  );
});
