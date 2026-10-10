import assert from "node:assert/strict";
import { test } from "node:test";

import { mixHexColors } from "./mix-hex-colors";

test("returns the ends at 0 and 1", () => {
  assert.equal(
    mixHexColors({ from: "#070a14", to: "#ffffff", amount: 0 }),
    "#070a14"
  );
  assert.equal(
    mixHexColors({ from: "#070a14", to: "#ffffff", amount: 1 }),
    "#ffffff"
  );
});

test("mixes each channel", () => {
  assert.equal(
    mixHexColors({ from: "#000000", to: "#ff8040", amount: 0.5 }),
    "#804020"
  );
});
