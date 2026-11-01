import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_CAMPAIGN_PLAN } from "./campaign-plan";
import { parseCampaignPlan } from "./parse-campaign-plan";
import { toCampaignPlanJson } from "./to-campaign-plan-json";

test("uses the owner's defaults for an empty plan", () => {
  assert.deepEqual(parseCampaignPlan({}), DEFAULT_CAMPAIGN_PLAN);
});

test("reads back what it stores", () => {
  const plan = {
    ...DEFAULT_CAMPAIGN_PLAN,
    maxPerDay: 3,
    startDate: "2026-11-09",
    kind: "follow-up" as const,
    intent: "Focus on the shared notebook.",
    eventDate: "2026-12-24",
    notBefore: { linkedin: "2026-12-14" },
  };
  assert.deepEqual(parseCampaignPlan(toCampaignPlanJson(plan)), plan);
});

test("replaces out-of-range fields with defaults", () => {
  const parsed = parseCampaignPlan({
    maxPerDay: 0,
    minGapMinutes: "45",
    availability: [{ fromHour: 30, toHour: 22 }],
    startDate: "next week",
    kind: "relaunch",
    notBefore: { linkedin: "soon", mastodon: "2026-12-14", x: "2026-12-01" },
  });
  assert.equal(parsed.maxPerDay, 2);
  assert.equal(parsed.minGapMinutes, 45);
  assert.deepEqual(parsed.availability.at(0), { fromHour: 20, toHour: 22 });
  assert.equal(parsed.startDate, undefined);
  assert.equal(parsed.kind, "launch");
  assert.equal(parsed.intent, "");
  assert.deepEqual(parsed.notBefore, { x: "2026-12-01" });
});
