import assert from "node:assert/strict";
import { test } from "node:test";

import { formatSgd } from "./format-sgd";

test("formats whole and part dollars", () => {
  assert.equal(formatSgd(500), "S$5");
  assert.equal(formatSgd(250), "S$2.50");
});
