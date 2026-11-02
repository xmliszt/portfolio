import assert from "node:assert/strict";
import { test } from "node:test";

import { matchThreadsPosts } from "./match-threads-posts";

test("matches posts to threads across hosts and trailing slashes", () => {
  const matches = matchThreadsPosts({
    threads: [
      { id: "m1", permalink: "https://www.threads.com/@yx/post/AAA" },
      { id: "m2", permalink: "https://www.threads.com/@yx/post/BBB" },
      { id: "m3", permalink: undefined },
    ],
    posts: [
      {
        id: "p1",
        url: "https://www.threads.net/@yx/post/AAA/",
        platform_post_id: null,
      },
      { id: "p2", url: null, platform_post_id: null },
      {
        id: "p3",
        url: "https://www.threads.net/@yx/post/CCC",
        platform_post_id: null,
      },
      {
        id: "p4",
        url: "threads.com/@yx/post/BBB?igshid=1",
        platform_post_id: null,
      },
    ],
  });
  assert.deepEqual(matches, [
    { postId: "p1", mediaId: "m1" },
    { postId: "p4", mediaId: "m2" },
  ]);
});

test("uses a post's stored media id without looking at its url", () => {
  const matches = matchThreadsPosts({
    threads: [],
    posts: [{ id: "p1", url: null, platform_post_id: "m9" }],
  });
  assert.deepEqual(matches, [{ postId: "p1", mediaId: "m9" }]);
});
