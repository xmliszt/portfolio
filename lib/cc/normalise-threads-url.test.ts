import assert from "node:assert/strict";
import { test } from "node:test";

import { normaliseThreadsUrl } from "./normalise-threads-url";

test("gives threads.net and threads.com links to one post the same path", () => {
  const paths = [
    "https://www.threads.net/@yx/post/DAbc123",
    "https://threads.com/@yx/post/DAbc123/",
    "www.threads.com/@yx/post/DAbc123?xmt=abc#top",
    "  http://THREADS.NET/@yx/post/DAbc123//  ",
  ].map(normaliseThreadsUrl);
  assert.deepEqual(new Set(paths), new Set(["/@yx/post/DAbc123"]));
});

test("rejects other hosts, bare hosts and blanks", () => {
  assert.equal(normaliseThreadsUrl("https://x.com/yx/status/1"), undefined);
  assert.equal(
    normaliseThreadsUrl("https://notthreads.net/@yx/post/1"),
    undefined
  );
  assert.equal(normaliseThreadsUrl("https://www.threads.com/"), undefined);
  assert.equal(normaliseThreadsUrl(""), undefined);
});
