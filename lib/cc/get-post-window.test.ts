import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_CAMPAIGN_PLAN } from "./campaign-plan";
import { getPostWindow } from "./get-post-window";

test("leaves a launch with no repost gap open", () => {
  assert.deepEqual(
    getPostWindow({ plan: DEFAULT_CAMPAIGN_PLAN, platformId: "x", wave: 1 }),
    { notBefore: undefined, notAfter: undefined }
  );
});

test("holds a platform until its repost gap ends", () => {
  assert.deepEqual(
    getPostWindow({
      plan: { ...DEFAULT_CAMPAIGN_PLAN, notBefore: { linkedin: "2026-12-14" } },
      platformId: "linkedin",
      wave: 2,
    }),
    { notBefore: new Date("2026-12-13T16:00:00Z"), notAfter: undefined }
  );
});

test("keeps an event's reminder on the day before and its wave on the day", () => {
  const plan = {
    ...DEFAULT_CAMPAIGN_PLAN,
    kind: "event" as const,
    eventDate: "2026-12-24",
    notBefore: { x: "2026-12-30" },
  };
  assert.deepEqual(getPostWindow({ plan, platformId: "threads", wave: 1 }), {
    notBefore: new Date("2026-12-22T16:00:00Z"),
    notAfter: new Date("2026-12-23T16:00:00Z"),
  });
  assert.deepEqual(getPostWindow({ plan, platformId: "threads", wave: 2 }), {
    notBefore: new Date("2026-12-23T16:00:00Z"),
    notAfter: new Date("2026-12-24T16:00:00Z"),
  });
  assert.deepEqual(getPostWindow({ plan, platformId: "x", wave: 1 }), {
    notBefore: new Date("2026-12-29T16:00:00Z"),
    notAfter: new Date("2026-12-23T16:00:00Z"),
  });
});
