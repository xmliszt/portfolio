import assert from "node:assert/strict";
import { test } from "node:test";

import { buildRuleMessage } from "./build-rule-message";

const match = {
  ruleId: "r",
  postId: "original",
  views: 160,
  median: 100,
  ratio: 1.6,
};

test("announces a scheduled quote-post with Skip and composer buttons for the repost", () => {
  const message = buildRuleMessage({
    action: {
      ...match,
      kind: "schedule-repost",
      platformId: "x",
      mode: "quote",
      at: new Date("2026-11-04T14:00:00Z"),
      reason: "",
    },
    postName: "I made a small room",
    repostId: "repost",
  });
  assert.equal(
    message.text,
    "🔁 Scheduled a quote-post of your X post for Wed 04 Nov 22:00 · write a new first line in Composer · Skip\nI made a small room\nIt did 1.6× your X median at +24 h."
  );
  assert.deepEqual(message.buttons, [
    { kind: "callback", text: "Skip", data: "skip:repost" },
    {
      kind: "url",
      text: "Open composer",
      url: "https://cc.liyuxuan.dev/composer?post=repost",
    },
  ]);
});

test("announces a saved re-cut slot", () => {
  const message = buildRuleMessage({
    action: {
      ...match,
      kind: "schedule-repost",
      platformId: "threads",
      mode: "recut",
      at: new Date("2026-11-04T14:00:00Z"),
      reason: "",
    },
    postName: "Paws",
    repostId: "repost",
  });
  assert.match(
    message.text,
    /^✂️ Saved a re-cut slot for Wed 04 Nov 22:00 · rewrite it in Composer · Skip\n/
  );
});

test("suggests a re-cut for a weak post with a composer button", () => {
  const message = buildRuleMessage({
    action: { ...match, ratio: 0.4, kind: "suggest-recut", platformId: "x" },
    postName: "Paws",
    repostId: undefined,
  });
  assert.equal(
    message.text,
    "📉 X · Paws did 0.4× your median at +24 h. Try a new first line or a different image; open in composer."
  );
  assert.deepEqual(message.buttons, [
    {
      kind: "url",
      text: "Open composer",
      url: "https://cc.liyuxuan.dev/composer?post=original",
    },
  ]);
});

test("suggests a repost with the platform's advice where CC never schedules one", () => {
  const message = buildRuleMessage({
    action: { ...match, kind: "suggest-repost", platformId: "youtube" },
    postName: "Paws",
    repostId: undefined,
  });
  assert.equal(
    message.text,
    "🔁 YouTube · Paws did 1.6× your median at +24 h. Don't re-upload. Cut a Short from the video instead."
  );
});
