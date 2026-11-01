import assert from "node:assert/strict";
import { test } from "node:test";

import { checkVoice } from "./check-voice";

const X_POST = `I made a small room on the Internet where strangers meet through their cats 🐾

You look up at them through frosted glass, so everything is soft and hazy. I've always felt some things are more real when you can't see every detail. Maybe people are too.

paws.garden`;

const THREADS_POST = `I made a small room on the Internet where strangers meet through their cats 🐾

I love Impressionist paintings and the grain of risograph prints. Things feel more real to me when I can't see every detail, and I wonder if meeting people is like that too. So in Paws you look up at everyone's cats through frosted glass.

You won't know whose cat it is. But one might wander over and press its paw to your fingertip, and that's all.

paws.garden`;

const XIAOHONGSHU_BODY = `我一直觉得，人与人之间有些很奇妙的相遇。

我们不一定要认识彼此，也不一定要知道对方是谁。有时候只是短暂地遇见，甚至隔着一层朦胧的玻璃，却依然能感受到对方的存在。

我很喜欢印象派的画，也喜欢 Risograph 印刷那种细腻的颗粒感。有些东西不必看得那么清楚，反而更能感受到它的真实。也许人和人的相遇，有时候也是这样。

于是就有了 Paws，一间小小的、毛绒绒的房间。你隔着磨砂玻璃，从下面抬头看大家的猫。你不知道它们的主人是谁，但也许某一刻，一只猫会慢慢走过来，好奇地看着你，轻轻把爪子贴在你的指尖。

这里没有什么需要完成的事。可以捏一只自己的猫带进来，给它一个声音；可以丢一个毛线球进去；也可以只是待一会儿，看光线跟着你那里的时间慢慢变。

如果它能让你放松一下，开心一下，那我就很满足了 🫶

免费，18 种语言 👉 paws.garden

#数字艺术 #孔版印刷 #猫 #治愈系 #独立开发 #小众网站 #交互艺术`;

function ruleIds(options: { text: string; maxHashtags?: number }) {
  return checkVoice({
    text: options.text,
    maxHashtags: options.maxHashtags ?? 2,
  }).map((flag) => flag.ruleId);
}

test("leaves the human-written Paws posts unflagged", () => {
  assert.deepEqual(ruleIds({ text: X_POST, maxHashtags: 2 }), []);
  assert.deepEqual(ruleIds({ text: THREADS_POST, maxHashtags: 1 }), []);
  assert.deepEqual(ruleIds({ text: XIAOHONGSHU_BODY, maxHashtags: 8 }), []);
});

test("flags em dashes and spaced hyphens with their positions", () => {
  const text = "soft — and hazy - quiet. well-made";
  assert.deepEqual(checkVoice({ text, maxHashtags: 2 }), [
    {
      ruleId: "em-dash",
      start: 5,
      end: 6,
      label: "Em dash",
      reason:
        "Readers now treat the em dash as the most common AI tell. Use two sentences or a comma.",
    },
    {
      ruleId: "em-dash",
      start: 15,
      end: 18,
      label: "Em dash",
      reason:
        "Readers now treat the em dash as the most common AI tell. Use two sentences or a comma.",
    },
  ]);
});

test("flags a not-X-it's-Y pivot", () => {
  assert.deepEqual(ruleIds({ text: "It's not a game, it's a feeling." }), [
    "not-x-its-y",
  ]);
  assert.deepEqual(
    ruleIds({ text: "This isn't about cats. It's about people." }),
    ["not-x-its-y"]
  );
});

test("flags triplets only when a post has two or more", () => {
  assert.deepEqual(ruleIds({ text: "It is soft, slow and quiet." }), []);
  assert.deepEqual(
    ruleIds({ text: "It is soft, slow and quiet. Warm, calm, kind." }),
    ["triplet", "triplet"]
  );
  assert.deepEqual(
    ruleIds({
      text: "It's a tiny, fluffy room, seen from below. Look through glass, hazy and soft, and maybe one wanders over.",
    }),
    []
  );
  assert.deepEqual(ruleIds({ text: "温暖、柔软、治愈。" }), []);
  assert.deepEqual(ruleIds({ text: "温暖、柔软、治愈。安静、缓慢、真实。" }), [
    "zh-triplet",
    "zh-triplet",
  ]);
});

test("flags stock openers and closers", () => {
  assert.deepEqual(
    ruleIds({ text: "Imagine a room full of cats.\nLet's dive in" }),
    ["stock-opener", "stock-closer"]
  );
  assert.deepEqual(ruleIds({ text: "Ever wondered why? The best part?" }), [
    "stock-opener",
    "stock-closer",
  ]);
});

test("flags hype words and hedged grandeur on word boundaries", () => {
  assert.deepEqual(
    ruleIds({
      text: "A Seamless, immersive journey. A love letter to cats. Unlocked.",
    }),
    ["hype-word", "hype-word", "hype-word", "hedged-grandeur", "hype-word"]
  );
  assert.deepEqual(ruleIds({ text: "Journeyman tapestrying" }), []);
});

test("flags five short lines in a row as broetry, ignoring blank lines", () => {
  const text =
    "I made a thing.\n\nIt took a year.\nIt was hard.\n\nI cried.\nI shipped it.\nHere it is.";
  assert.deepEqual(
    checkVoice({ text, maxHashtags: 2 }).map((flag) => flag),
    [
      {
        ruleId: "broetry",
        start: 0,
        end: text.length,
        label: "Broetry",
        reason:
          "One short sentence per line for 5+ lines is an engagement-bait layout.",
      },
    ]
  );
  assert.deepEqual(
    ruleIds({
      text: "One.\nTwo.\nThree.\nFour, and a long line that goes on and on past the limit.\nFive.",
    }),
    []
  );
});

test("flags only the hashtags past the platform's count", () => {
  const flags = checkVoice({
    text: "#cats #art #riso #4 rank",
    maxHashtags: 2,
  });
  assert.deepEqual(
    flags.map((flag) => [flag.ruleId, flag.start, flag.end]),
    [["hashtag-stuffing", 11, 16]]
  );
});

test("flags each exclamation mark once there are two", () => {
  assert.deepEqual(ruleIds({ text: "Hi!" }), []);
  assert.deepEqual(ruleIds({ text: "Hi! Bye!" }), [
    "exclamations",
    "exclamations",
  ]);
});

test("flags the 中文 rules", () => {
  assert.deepEqual(ruleIds({ text: "沉浸式体验，治愈每一个孤独的灵魂" }), [
    "zh-big-words",
    "zh-big-words",
    "zh-big-words",
  ]);
  assert.deepEqual(ruleIds({ text: "你有没有想过……快来试试吧" }), [
    "zh-stock-opener",
    "zh-stock-closer",
  ]);
  assert.deepEqual(ruleIds({ text: "猫——一只猫" }), []);
  assert.deepEqual(ruleIds({ text: "猫——一只猫——好" }), ["zh-dash", "zh-dash"]);
  assert.deepEqual(ruleIds({ text: "好可爱！！！" }), ["zh-exclamation-stack"]);
});
