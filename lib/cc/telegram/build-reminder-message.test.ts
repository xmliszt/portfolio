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
    {
      kind: "url",
      text: "Open Product Hunt",
      url: "https://www.producthunt.com/",
    },
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

test("links the live post from the log message so the counts are one tap away", () => {
  const message = buildReminderMessage({
    kind: "log",
    post: { ...post("x"), url: "https://x.com/me/status/1" },
    checkpoint: "1h",
    lastValues: {},
  });
  assert.deepEqual(message.buttons.at(0), {
    kind: "url",
    text: "Open the post",
    url: "https://x.com/me/status/1",
  });
});

test("keeps only the CC button on the log message when the post has no link", () => {
  const message = buildReminderMessage({
    kind: "log",
    post: post("x"),
    checkpoint: "1h",
    lastValues: {},
  });
  assert.deepEqual(
    message.buttons.map((button) => button.text),
    ["Log in CC"]
  );
});
