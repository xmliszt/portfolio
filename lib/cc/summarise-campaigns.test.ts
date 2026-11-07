import assert from "node:assert/strict";
import { test } from "node:test";

import type { CampaignRow } from "./data/cc-rows";
import { buildPostRow } from "./testing/build-post-row";
import { summariseCampaigns } from "./summarise-campaigns";

function buildCampaignRow(options: Partial<CampaignRow>): CampaignRow {
  return {
    id: "campaign-1",
    name: "Joodle 2.1",
    code: "JDL",
    color: "violet",
    link: null,
    notes: null,
    plan: {},
    starts_at: "2026-11-04T00:00:00.000Z",
    created_at: "2026-11-01T00:00:00.000Z",
    ...options,
  };
}

const NOW = new Date("2026-11-07T06:00:00.000Z");

test("counts upcoming top-level posts and picks the soonest", () => {
  const [summary] = summariseCampaigns({
    campaigns: [buildCampaignRow({})],
    posts: [
      buildPostRow({ id: "a", scheduled_at: "2026-11-08T02:00:00.000Z" }),
      buildPostRow({
        id: "b",
        platform: "threads",
        scheduled_at: "2026-11-07T11:00:00.000Z",
      }),
      buildPostRow({
        id: "reply",
        kind: "reply",
        scheduled_at: "2026-11-07T10:00:00.000Z",
      }),
      buildPostRow({
        id: "past",
        scheduled_at: "2026-11-07T01:00:00.000Z",
      }),
      buildPostRow({
        id: "posted",
        status: "posted",
        scheduled_at: "2026-11-08T05:00:00.000Z",
      }),
    ],
    now: NOW,
  });
  assert.equal(summary?.upcomingCount, 2);
  assert.deepEqual(summary?.nextPost, {
    platform: "threads",
    at: "2026-11-07T11:00:00.000Z",
  });
  assert.equal(summary?.isActive, true);
});

test("counts a campaign with only a scheduled reply left as active", () => {
  const [summary] = summariseCampaigns({
    campaigns: [buildCampaignRow({})],
    posts: [
      buildPostRow({
        kind: "reply",
        scheduled_at: "2026-11-08T02:00:00.000Z",
      }),
    ],
    now: NOW,
  });
  assert.equal(summary?.isActive, true);
  assert.equal(summary?.upcomingCount, 0);
  assert.equal(summary?.nextPost, undefined);
});

test("lists active campaigns first, each group newest start first", () => {
  const summaries = summariseCampaigns({
    campaigns: [
      buildCampaignRow({ id: "old", starts_at: "2026-10-01T00:00:00.000Z" }),
      buildCampaignRow({ id: "done", starts_at: "2026-11-05T00:00:00.000Z" }),
      buildCampaignRow({ id: "new", starts_at: "2026-11-06T00:00:00.000Z" }),
    ],
    posts: [
      buildPostRow({
        campaign_id: "old",
        scheduled_at: "2026-11-09T00:00:00.000Z",
      }),
      buildPostRow({
        campaign_id: "new",
        scheduled_at: "2026-11-09T01:00:00.000Z",
      }),
    ],
    now: NOW,
  });
  assert.deepEqual(
    summaries.map((summary) => [summary.id, summary.isActive]),
    [
      ["new", true],
      ["old", true],
      ["done", false],
    ]
  );
});
