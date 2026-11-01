import assert from "node:assert/strict";
import { test } from "node:test";

import { buildHistoryPost } from "./testing/build-history-post";
import { summariseCampaignHistory } from "./summarise-campaign-history";

test("lists each platform's posts best ratio first, then posts without numbers, at most 5", () => {
  const summary = summariseCampaignHistory({
    posts: [
      buildHistoryPost({
        platformId: "x",
        at: "2026-10-01T12:00:00Z",
        views24h: 50,
      }),
      buildHistoryPost({ platformId: "x", at: "2026-10-02T12:00:00Z" }),
      buildHistoryPost({
        platformId: "x",
        at: "2026-10-03T12:00:00Z",
        views24h: 1830,
        firstLine:
          "The notebook by the dryers is full of strangers' handwriting",
        assetFiles: ["laundro-promo-16x9.mp4"],
      }),
      buildHistoryPost({
        platformId: "x",
        at: "2026-10-04T12:00:00Z",
        views24h: 100,
      }),
      buildHistoryPost({ platformId: "x", at: "2026-10-05T12:00:00Z" }),
      buildHistoryPost({
        platformId: "x",
        at: "2026-10-06T12:00:00Z",
        views24h: 20,
      }),
      buildHistoryPost({
        platformId: "x",
        at: "2026-10-07T12:00:00Z",
        isPosted: false,
      }),
      buildHistoryPost({
        platformId: "reddit",
        at: "2026-10-08T12:00:00Z",
        target: "r/InternetIsBeautiful",
        assetFiles: ["a.png", "b.png"],
      }),
    ],
    platformIds: ["x", "reddit", "linkedin"],
  });
  assert.equal(
    summary,
    [
      "X",
      `- 2026-10-03 · "The notebook by the dryers is full of strangers' handwriting" · 1,830 views at 24 h, 18.3× median · promo video`,
      `- 2026-10-04 · "A post on 2026-10-04T12:00:00Z" · 100 views at 24 h, 1.0× median · no media`,
      `- 2026-10-01 · "A post on 2026-10-01T12:00:00Z" · 50 views at 24 h, 0.5× median · no media`,
      `- 2026-10-06 · "A post on 2026-10-06T12:00:00Z" · 20 views at 24 h, 0.2× median · no media`,
      `- 2026-10-05 · "A post on 2026-10-05T12:00:00Z" · no numbers · no media`,
      "",
      "Reddit",
      `- 2026-10-08 · "A post on 2026-10-08T12:00:00Z" · no numbers · 2 images · r/InternetIsBeautiful`,
    ].join("\n")
  );
});

test("cuts a first line to 80 characters", () => {
  const summary = summariseCampaignHistory({
    posts: [
      buildHistoryPost({
        platformId: "threads",
        at: "2026-10-01T12:00:00Z",
        firstLine: "word ".repeat(30),
      }),
    ],
    platformIds: ["threads"],
  });
  const quoted = summary.split('"').at(1) ?? "";
  assert.equal(quoted.length, 80);
  assert.ok(quoted.endsWith("…"));
});

test("returns an empty string when nothing was posted", () => {
  assert.equal(summariseCampaignHistory({ posts: [], platformIds: ["x"] }), "");
});
