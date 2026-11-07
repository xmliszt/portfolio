import assert from "node:assert/strict";
import { test } from "node:test";

import { normaliseCampaignCode } from "./normalise-campaign-code";

test("upper-cases and trims a valid code", () => {
  assert.equal(normaliseCampaignCode(" jdl "), "JDL");
  assert.equal(normaliseCampaignCode("v21"), "V21");
});

test("rejects codes that are too short, too long or not ASCII", () => {
  assert.equal(normaliseCampaignCode("J"), undefined);
  assert.equal(normaliseCampaignCode("JOODL"), undefined);
  assert.equal(normaliseCampaignCode("J-D"), undefined);
  assert.equal(normaliseCampaignCode("稚笔"), undefined);
});
