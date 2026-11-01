import assert from "node:assert/strict";
import { test } from "node:test";

import { toKeywordCountRows } from "./to-keyword-count-rows";

const fetchedAt = new Date("2026-11-01T02:10:00Z");

test("maps each bucket to a row keyed by its UTC day", () => {
  const rows = toKeywordCountRows({
    keywordId: "k1",
    fetchedAt,
    response: {
      data: [
        {
          start: "2026-10-30T00:00:00.000Z",
          end: "2026-10-31T00:00:00.000Z",
          post_count: 12,
        },
        {
          start: "2026-10-31T00:00:00.000Z",
          end: "2026-11-01T00:00:00.000Z",
          post_count: 7,
        },
      ],
    },
  });
  assert.deepEqual(rows, [
    {
      keyword_id: "k1",
      day: "2026-10-30",
      source: "x",
      count: 12,
      fetched_at: "2026-11-01T02:10:00.000Z",
    },
    {
      keyword_id: "k1",
      day: "2026-10-31",
      source: "x",
      count: 7,
      fetched_at: "2026-11-01T02:10:00.000Z",
    },
  ]);
});

test("returns no rows when the response has no data or no counts", () => {
  assert.deepEqual(
    toKeywordCountRows({ keywordId: "k1", fetchedAt, response: {} }),
    []
  );
  assert.deepEqual(
    toKeywordCountRows({
      keywordId: "k1",
      fetchedAt,
      response: {
        data: [
          {
            start: "2026-10-30T00:00:00.000Z",
            end: "2026-10-31T00:00:00.000Z",
          },
        ],
      },
    }),
    []
  );
});
