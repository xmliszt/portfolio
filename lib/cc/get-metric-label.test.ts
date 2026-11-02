import assert from "node:assert/strict";
import { test } from "node:test";

import { getMetricLabel } from "./get-metric-label";

test("uses the platform's own name for a metric", () => {
  assert.equal(
    getMetricLabel({ platformId: "x", field: "saves" }),
    "bookmarks"
  );
  assert.equal(
    getMetricLabel({ platformId: "linkedin", field: "views" }),
    "impressions"
  );
  assert.equal(
    getMetricLabel({ platformId: "xiaohongshu", field: "follows" }),
    "涨粉"
  );
});

test("falls back to the field name with spaces", () => {
  assert.equal(
    getMetricLabel({ platformId: "x", field: "profile_visits" }),
    "profile visits"
  );
  assert.equal(
    getMetricLabel({ platformId: "reddit", field: "upvotes" }),
    "upvotes"
  );
});
