import assert from "node:assert/strict";
import { test } from "node:test";

import { pickCampaignColor } from "./pick-campaign-color";

test("starts with the first colour", () => {
  assert.equal(pickCampaignColor([]), "violet");
});

test("picks the first unused colour", () => {
  assert.equal(pickCampaignColor(["violet", "teal"]), "gold");
});

test("picks the least used colour once every colour is taken", () => {
  assert.equal(
    pickCampaignColor([
      "violet",
      "gold",
      "teal",
      "coral",
      "orchid",
      "lime",
      "slate",
      "violet",
    ]),
    "gold"
  );
});

test("ignores colours that are not in the palette", () => {
  assert.equal(pickCampaignColor(["pink"]), "violet");
});
