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
      { id: "p1", url: "https://www.threads.net/@yx/post/AAA/" },
      { id: "p2", url: null },
      { id: "p3", url: "https://www.threads.net/@yx/post/CCC" },
      { id: "p4", url: "threads.com/@yx/post/BBB?igshid=1" },
    ],
  });
  assert.deepEqual(matches, [
    { postId: "p1", mediaId: "m1" },
    { postId: "p4", mediaId: "m2" },
  ]);
});
