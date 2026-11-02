import assert from "node:assert/strict";
import { test } from "node:test";

import { buildComposeUrl } from "./build-compose-url";

test("prefills X, Threads and Bluesky with the encoded body", () => {
  assert.deepEqual(
    buildComposeUrl({ platformId: "x", body: "Hi & bye 🐾\npaws.garden" }),
    {
      kind: "prefilled",
      url: "https://x.com/intent/post?text=Hi%20%26%20bye%20%F0%9F%90%BE%0Apaws.garden",
    }
  );
  assert.deepEqual(buildComposeUrl({ platformId: "threads", body: "a b" }), {
    kind: "prefilled",
    url: "https://www.threads.net/intent/post?text=a%20b",
  });
  assert.deepEqual(buildComposeUrl({ platformId: "bluesky", body: "a b" }), {
    kind: "prefilled",
    url: "https://bsky.app/intent/compose?text=a%20b",
  });
});

test("builds a Reddit link post when there is a link and no text", () => {
  assert.deepEqual(
    buildComposeUrl({
      platformId: "reddit",
      body: "",
      title: "A quiet room",
      link: "https://paws.garden",
      target: "r/InternetIsBeautiful",
    }),
    {
      kind: "prefilled",
      url: "https://www.reddit.com/r/InternetIsBeautiful/submit?title=A%20quiet%20room&url=https%3A%2F%2Fpaws.garden",
    }
  );
});

test("builds a Reddit text post when there is text, even with a link", () => {
  assert.equal(
    buildComposeUrl({
      platformId: "reddit",
      body: "Hi",
      title: "t",
      link: "https://paws.garden",
      target: "SideProject",
    }).url,
    "https://www.reddit.com/r/SideProject/submit?title=t&type=TEXT&text=Hi%0A%0Ahttps%3A%2F%2Fpaws.garden"
  );
});

test("builds a Reddit text post without a link", () => {
  assert.deepEqual(
    buildComposeUrl({
      platformId: "reddit",
      body: "Hi everyone :)",
      title: "I made a room",
      target: "SideProject",
    }),
    {
      kind: "prefilled",
      url: "https://www.reddit.com/r/SideProject/submit?title=I%20made%20a%20room&type=TEXT&text=Hi%20everyone%20%3A)",
    }
  );
});

test("falls back to Reddit's generic submit page without a subreddit", () => {
  assert.equal(
    buildComposeUrl({ platformId: "reddit", body: "x", title: "t" }).url,
    "https://www.reddit.com/submit?title=t&type=TEXT&text=x"
  );
});

test("opens the platform's composer for the rest", () => {
  assert.deepEqual(buildComposeUrl({ platformId: "xiaohongshu", body: "x" }), {
    kind: "copy-then-open",
    url: "https://creator.xiaohongshu.com/publish/publish",
  });
  assert.deepEqual(buildComposeUrl({ platformId: "producthunt", body: "x" }), {
    kind: "copy-then-open",
    url: "https://www.producthunt.com/posts/new",
  });
});
