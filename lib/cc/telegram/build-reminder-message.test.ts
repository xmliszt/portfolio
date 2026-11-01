import assert from "node:assert/strict";
import { test } from "node:test";

import { buildReminderMessage } from "./build-reminder-message";

const post = (platformId: "producthunt" | "x") => ({
  id: "p",
  platformId,
  title: "Paws",
  body: "Hello",
  target: null,
  url: null,
});

test("tells the owner a scheduled Product Hunt launch goes live, not to post it", () => {
  const message = buildReminderMessage({
    kind: "post",
    post: post("producthunt"),
    timeLabel: "16:01",
    composeUrl: "https://www.producthunt.com/posts/new",
    media: [],
  });
  assert.match(message.text, /^🚀 Launch goes live · Product Hunt · 16:01/);
  assert.deepEqual(message.buttons, [
    { text: "Open Product Hunt", url: "https://www.producthunt.com/" },
  ]);
});

test("keeps the post-now message for other platforms", () => {
  const message = buildReminderMessage({
    kind: "post",
    post: post("x"),
    timeLabel: "22:00",
    composeUrl: "https://x.com/intent/post?text=Hello",
    media: [],
  });
  assert.match(message.text, /^⏰ Post now · X · 22:00/);
});
