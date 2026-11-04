import assert from "node:assert/strict";
import { test } from "node:test";

import { isTrackedPost } from "./is-tracked-post";

const CAMPAIGN_FIELDS = { campaignId: "campaign-1", postedAt: null };

test("tracks scheduled and posted posts and reposts", () => {
  assert.equal(
    isTrackedPost({
      kind: "post",
      status: "scheduled",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    true
  );
  assert.equal(
    isTrackedPost({
      kind: "post",
      status: "posted",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    true
  );
  assert.equal(
    isTrackedPost({
      kind: "repost",
      status: "scheduled",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    true
  );
  assert.equal(
    isTrackedPost({
      kind: "repost",
      status: "posted",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    true
  );
});

test("leaves out drafts, skipped posts, replies and comments", () => {
  assert.equal(
    isTrackedPost({
      kind: "repost",
      status: "draft",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    false
  );
  assert.equal(
    isTrackedPost({
      kind: "repost",
      status: "skipped",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    false
  );
  assert.equal(
    isTrackedPost({
      kind: "reply",
      status: "scheduled",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    false
  );
  assert.equal(
    isTrackedPost({
      kind: "comment",
      status: "posted",
      repostAs: "post",
      ...CAMPAIGN_FIELDS,
    }),
    false
  );
});

test("leaves out plain reposts once they are live", () => {
  assert.equal(
    isTrackedPost({
      kind: "repost",
      status: "scheduled",
      repostAs: "repost",
      ...CAMPAIGN_FIELDS,
    }),
    true
  );
  assert.equal(
    isTrackedPost({
      kind: "repost",
      status: "posted",
      repostAs: "repost",
      ...CAMPAIGN_FIELDS,
    }),
    false
  );
  assert.equal(
    isTrackedPost({
      kind: "repost",
      status: "posted",
      repostAs: "quote",
      ...CAMPAIGN_FIELDS,
    }),
    true
  );
});

test("tracks a custom post until it is posted", () => {
  assert.equal(
    isTrackedPost({
      kind: "post",
      status: "scheduled",
      repostAs: "post",
      campaignId: null,
      postedAt: null,
    }),
    true
  );
  assert.equal(
    isTrackedPost({
      kind: "post",
      status: "posted",
      repostAs: "post",
      campaignId: null,
      postedAt: "2026-11-04T13:00:00.000Z",
    }),
    false
  );
});
