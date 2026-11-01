import assert from "node:assert/strict";
import { test } from "node:test";

import { findScheduleClashes } from "./find-schedule-clashes";
import { sgtToUtc } from "./sgt-to-utc";

function buildPost(options: {
  id: string;
  at: Date;
  kind?: string;
  status?: string;
}) {
  return {
    id: options.id,
    at: options.at,
    kind: options.kind ?? "post",
    status: options.status ?? "scheduled",
  };
}

function sgt(date: string, time: string) {
  return sgtToUtc({ date, time });
}

test("flags posts on any platform closer than the minimum gap", () => {
  const clashes = findScheduleClashes({
    at: sgt("2026-11-04", "22:00"),
    postId: undefined,
    posts: [
      buildPost({ id: "a", at: sgt("2026-11-04", "21:30") }),
      buildPost({ id: "b", at: sgt("2026-11-04", "22:45") }),
    ],
    minGapMinutes: 45,
    maxPerDay: 3,
  });
  assert.deepEqual(clashes, [
    {
      kind: "gap",
      postId: "a",
      at: sgt("2026-11-04", "21:30"),
      minutesApart: 30,
    },
  ]);
});

test("flags a Singapore day that already holds the maximum posts", () => {
  const clashes = findScheduleClashes({
    at: sgt("2026-11-04", "23:30"),
    postId: undefined,
    posts: [
      buildPost({ id: "a", at: sgt("2026-11-04", "08:00") }),
      buildPost({ id: "b", at: sgt("2026-11-04", "12:00") }),
      buildPost({ id: "c", at: sgt("2026-11-05", "00:30") }),
    ],
    minGapMinutes: 45,
    maxPerDay: 2,
  });
  assert.deepEqual(clashes, [{ kind: "day", count: 2 }]);
});

test("ignores the post itself, skipped posts, replies and comments", () => {
  const at = sgt("2026-11-04", "22:00");
  const clashes = findScheduleClashes({
    at,
    postId: "self",
    posts: [
      buildPost({ id: "self", at }),
      buildPost({ id: "skipped", at, status: "skipped" }),
      buildPost({ id: "reply", at, kind: "reply" }),
      buildPost({ id: "comment", at, kind: "comment" }),
    ],
    minGapMinutes: 45,
    maxPerDay: 1,
  });
  assert.deepEqual(clashes, []);
});

test("counts reposts and posted posts as taken", () => {
  const clashes = findScheduleClashes({
    at: sgt("2026-11-04", "22:00"),
    postId: undefined,
    posts: [
      buildPost({
        id: "repost",
        at: sgt("2026-11-04", "22:10"),
        kind: "repost",
      }),
      buildPost({
        id: "posted",
        at: sgt("2026-11-04", "21:50"),
        status: "posted",
      }),
    ],
    minGapMinutes: 45,
    maxPerDay: 2,
  });
  assert.deepEqual(
    clashes.map((clash) => clash.kind),
    ["gap", "gap", "day"]
  );
});
