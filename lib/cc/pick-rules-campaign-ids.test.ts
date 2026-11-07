import assert from "node:assert/strict";
import { test } from "node:test";

import { pickRulesCampaignIds } from "./pick-rules-campaign-ids";

test("runs every active campaign plus an inactive newest one", () => {
  assert.deepEqual(
    pickRulesCampaignIds({
      summaries: [
        { id: "a", isActive: true },
        { id: "b", isActive: false },
        { id: "c", isActive: true },
      ],
      newestId: "b",
    }),
    ["a", "c", "b"]
  );
});

test("lists an active newest campaign once", () => {
  assert.deepEqual(
    pickRulesCampaignIds({
      summaries: [{ id: "a", isActive: true }],
      newestId: "a",
    }),
    ["a"]
  );
});

test("runs nothing when no campaign exists", () => {
  assert.deepEqual(
    pickRulesCampaignIds({ summaries: [], newestId: undefined }),
    []
  );
});
