import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveCampaignCode } from "./derive-campaign-code";

test("takes the first three letters and digits in upper case", () => {
  assert.equal(deriveCampaignCode("Joodle 2.1"), "JOO");
  assert.equal(deriveCampaignCode("paws.garden"), "PAW");
});

test("keeps a two-letter name whole", () => {
  assert.equal(deriveCampaignCode("Go"), "GO");
});

test("falls back to CMP when the name has fewer than two ASCII letters", () => {
  assert.equal(deriveCampaignCode("稚笔"), "CMP");
  assert.equal(deriveCampaignCode("X"), "CMP");
});
