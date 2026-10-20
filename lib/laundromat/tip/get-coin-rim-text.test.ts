import assert from "node:assert/strict";
import { test } from "node:test";

import { getCoinRimText } from "./get-coin-rim-text";

test("repeats the site and thanks as close to a full ring as whole repeats allow", () => {
  assert.equal(
    getCoinRimText({ siteName: "laundro.cafe", thanks: "thank you" }),
    "laundro.cafe · thank you · laundro.cafe · thank you · "
  );
  for (const thanks of ["谢谢", "dziękuję", "gracias", "terima kasih"]) {
    const segment = `laundro.cafe · ${thanks} · `;
    const text = getCoinRimText({ siteName: "laundro.cafe", thanks });
    assert.ok(
      Math.abs(text.length - 54) <= segment.length / 2,
      `${thanks}: ${text.length}`
    );
  }
});
