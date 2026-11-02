import assert from "node:assert/strict";
import { test } from "node:test";

import { toThreadsMetricValues } from "./to-threads-metric-values";

test("maps replies to comments and keeps reposts, quotes and shares apart", () => {
  assert.deepEqual(
    toThreadsMetricValues([
      { name: "views", values: [{ value: 1200 }] },
      { name: "likes", values: [{ value: 40 }] },
      { name: "replies", values: [{ value: 6 }] },
      { name: "reposts", values: [{ value: 3 }] },
      { name: "quotes", values: [{ value: 1 }] },
      { name: "shares", values: [{ value: 2 }] },
    ]),
    { views: 1200, likes: 40, comments: 6, reposts: 3, quotes: 1, shares: 2 }
  );
});

test("leaves out metrics Threads did not return", () => {
  assert.deepEqual(
    toThreadsMetricValues([
      { name: "likes", values: [{ value: 0 }] },
      { name: "quotes", total_value: { value: 2 } },
    ]),
    {
      views: undefined,
      likes: 0,
      comments: undefined,
      reposts: undefined,
      quotes: 2,
      shares: undefined,
    }
  );
  assert.deepEqual(toThreadsMetricValues([]), {
    views: undefined,
    likes: undefined,
    comments: undefined,
    reposts: undefined,
    quotes: undefined,
    shares: undefined,
  });
});
