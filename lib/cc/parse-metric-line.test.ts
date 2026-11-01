import assert from "node:assert/strict";
import { test } from "node:test";

import { parseMetricLine } from "./parse-metric-line";

const fields = ["views", "likes", "comments", "shares"] as const;

test("maps space-separated numbers to fields in order", () => {
  assert.deepEqual(parseMetricLine({ line: "1240 86 12 3", fields }), {
    kind: "ok",
    values: { views: 1240, likes: 86, comments: 12, shares: 3 },
  });
});

test("reads a comma before exactly three digits as a thousands separator", () => {
  assert.deepEqual(parseMetricLine({ line: "1,240, 86,12", fields }), {
    kind: "ok",
    values: { views: 1240, likes: 86, comments: 12, shares: undefined },
  });
  assert.deepEqual(parseMetricLine({ line: "1,24", fields }), {
    kind: "ok",
    values: { views: 1, likes: 24, comments: undefined, shares: undefined },
  });
  assert.deepEqual(parseMetricLine({ line: "1,240,000 / 5", fields }), {
    kind: "ok",
    values: {
      views: 1240000,
      likes: 5,
      comments: undefined,
      shares: undefined,
    },
  });
});

test("accepts slash separators and k, m, 万 and w suffixes", () => {
  assert.deepEqual(parseMetricLine({ line: "1.2k/3K/1.1m/1.2万", fields }), {
    kind: "ok",
    values: { views: 1200, likes: 3000, comments: 1100000, shares: 12000 },
  });
  assert.deepEqual(parseMetricLine({ line: "3w", fields }), {
    kind: "ok",
    values: {
      views: 30000,
      likes: undefined,
      comments: undefined,
      shares: undefined,
    },
  });
});

test("reads #4 as a rank and - or _ as skipped fields", () => {
  assert.deepEqual(
    parseMetricLine({
      line: "312 - _ #4",
      fields: ["upvotes", "comments", "clicks", "rank"],
    }),
    {
      kind: "ok",
      values: {
        upvotes: 312,
        comments: undefined,
        clicks: undefined,
        rank: 4,
      },
    }
  );
});

test("recognises undo", () => {
  assert.deepEqual(parseMetricLine({ line: " Undo ", fields }), {
    kind: "undo",
  });
});

test("rejects more numbers than fields", () => {
  assert.equal(parseMetricLine({ line: "1 2 3 4 5", fields }).kind, "error");
});

test("rejects an unreadable token or an empty line", () => {
  assert.deepEqual(parseMetricLine({ line: "12 abc", fields }), {
    kind: "error",
    reason: `Can't read "abc".`,
  });
  assert.equal(parseMetricLine({ line: "   ", fields }).kind, "error");
});

test("rejects a number larger than the database can store", () => {
  assert.equal(
    parseMetricLine({ line: "9".repeat(400), fields: ["views"] }).kind,
    "error"
  );
});
