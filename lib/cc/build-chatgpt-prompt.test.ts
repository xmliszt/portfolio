import assert from "node:assert/strict";
import { test } from "node:test";

import { buildChatgptPrompt } from "./build-chatgpt-prompt";

const fields = {
  product: "Paws",
  makersNote: "I love the little encounters we have with strangers.",
  platformId: "x",
  limitRule: "280 characters, a link counts as 23",
  audience: "people who like slow, artful web things",
  assets: ["a 62-second riso-style video", "a cover image"],
  draft: "I made a small room on the Internet 🐾",
  repost: undefined,
} as const;

test("fills the English template", () => {
  const prompt = buildChatgptPrompt({ ...fields, language: "en" });
  assert.ok(
    prompt.startsWith(
      "I'm Yuxuan. I make small things on the Internet. I'm about to post about Paws,"
    )
  );
  assert.ok(
    prompt.includes(`Why I made it, in my own words:\n${fields.makersNote}\n`)
  );
  assert.ok(
    prompt.includes("Platform: X. Limit: 280 characters, a link counts as 23.")
  );
  assert.ok(
    prompt.includes(
      "Who reads it there: people who like slow, artful web things."
    )
  );
  assert.ok(
    prompt.includes(
      "It goes out with: a 62-second riso-style video, a cover image."
    )
  );
  assert.ok(prompt.includes(`"""\n${fields.draft}\n"""`));
  assert.ok(prompt.endsWith("No em dashes, no hashtags unless I had them."));
  assert.ok(!prompt.includes("{"));
});

test("fills the 中文 template", () => {
  const prompt = buildChatgptPrompt({
    ...fields,
    platformId: "xiaohongshu",
    language: "zh",
  });
  assert.ok(prompt.includes("平台：小红书。"));
  assert.ok(
    prompt.includes(
      "一起发的素材：a 62-second riso-style video、a cover image。"
    )
  );
  assert.ok(prompt.includes(`"""\n${fields.draft}\n"""`));
  assert.ok(prompt.includes("不要用破折号"));
});

test("asks for a new opening on a repost, showing the original and the platform's advice", () => {
  const prompt = buildChatgptPrompt({
    ...fields,
    language: "en",
    repost: { original: "The first post", how: "Quote your own post." },
  });
  assert.ok(
    prompt.includes(
      'This is a repost of a post that did well. The original:\n"""\nThe first post\n"""\nHow to repost on X: Quote your own post.\n\nMy draft:'
    )
  );
  assert.ok(
    prompt.includes("Please give me a different opening on the same idea:")
  );
  assert.ok(!prompt.includes("a friend who loves poems"));
});
