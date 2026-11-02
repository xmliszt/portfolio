import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPublishMessage } from "./build-publish-message";

test("a posted message links to the live post", () => {
  const message = buildPublishMessage({
    kind: "posted",
    postId: "p1",
    platformId: "x",
    name: "Paws launch",
    timeLabel: "21:00",
    url: "https://x.com/i/web/status/1",
  });
  assert.match(message.text, /^✅ Auto-posted · X · 21:00\nPaws launch$/);
  assert.deepEqual(message.buttons, [
    { kind: "url", text: "Open the post", url: "https://x.com/i/web/status/1" },
  ]);
});

test("a failed message carries the error and the compose link", () => {
  const message = buildPublishMessage({
    kind: "failed",
    postId: "p1",
    platformId: "threads",
    name: "Paws launch",
    timeLabel: "21:00",
    error: "Threads publish failed: boom.",
    composeUrl: "https://www.threads.net/intent/post?text=hi",
  });
  assert.match(message.text, /Threads publish failed: boom\./);
  assert.equal(
    message.buttons.at(1)?.kind === "url" && message.buttons.at(1)?.text,
    "Open Threads"
  );
});

test("a compose link too long for a button falls back to the platform's page", () => {
  const message = buildPublishMessage({
    kind: "failed",
    postId: "p1",
    platformId: "x",
    name: "",
    timeLabel: "21:00",
    error: "x",
    composeUrl: `https://x.com/intent/post?text=${"a".repeat(2100)}`,
  });
  const button = message.buttons.at(1);
  assert.equal(
    button?.kind === "url" ? button.url : "",
    "https://x.com/intent/post"
  );
});
