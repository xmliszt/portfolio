import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPostRow } from "./testing/build-post-row";
import { getOccupiedSlots } from "./get-occupied-slots";

function occupiedIds(posts: Parameters<typeof getOccupiedSlots>[0]["posts"]) {
  return getOccupiedSlots({ posts, campaignId: "a" }).map(
    (slot) => slot.postId
  );
}

test("takes another campaign's and custom posts and reposts", () => {
  assert.deepEqual(
    occupiedIds([
      buildPostRow({ id: "b-post", campaign_id: "b" }),
      buildPostRow({ id: "b-repost", campaign_id: "b", kind: "repost" }),
      buildPostRow({ id: "custom", campaign_id: null, project: "Blog" }),
    ]),
    ["b-post", "b-repost", "custom"]
  );
});

test("takes the campaign's own reposts but not its posts", () => {
  assert.deepEqual(
    occupiedIds([
      buildPostRow({ id: "a-post", campaign_id: "a" }),
      buildPostRow({ id: "a-repost", campaign_id: "a", kind: "repost" }),
    ]),
    ["a-repost"]
  );
});

test("leaves out skipped, unscheduled, reply and comment rows", () => {
  assert.deepEqual(
    occupiedIds([
      buildPostRow({ id: "skipped", campaign_id: "b", status: "skipped" }),
      buildPostRow({ id: "draft", campaign_id: "b", scheduled_at: null }),
      buildPostRow({ id: "reply", campaign_id: "b", kind: "reply" }),
      buildPostRow({ id: "comment", campaign_id: "b", kind: "comment" }),
    ]),
    []
  );
});
