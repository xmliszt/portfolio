import assert from "node:assert/strict";
import { test } from "node:test";

import { PAWS_CHATGPT_REPLY } from "./testing/paws-smart-campaign";
import { parseSmartCampaignResponse } from "./parse-smart-campaign-response";

function parsePosts(text: string) {
  const result = parseSmartCampaignResponse(text);
  assert.equal(
    result.kind,
    "ok",
    result.kind === "error" ? result.message : ""
  );
  return result.kind === "ok" ? result : { posts: [], warnings: [] };
}

test("reads a fenced reply with a line of prose before it", () => {
  const result = parseSmartCampaignResponse(PAWS_CHATGPT_REPLY);
  assert.equal(result.kind, "ok");
  if (result.kind !== "ok") return;
  assert.deepEqual(result.campaign, {
    name: "Paws launch",
    tagline: "Meet strangers through their cats, behind frosted glass",
  });
  assert.equal(result.posts.length, 7);
  assert.deepEqual(result.warnings, []);
  const xiaohongshu = result.posts.find((post) => post.ref === "xiaohongshu-1");
  assert.equal(xiaohongshu?.title, "隔着磨砂玻璃，和陌生人的猫见一面🐾");
  assert.equal(xiaohongshu?.language, "zh");
  assert.deepEqual(xiaohongshu?.hashtags, [
    "数字艺术",
    "孔版印刷",
    "猫",
    "独立开发",
  ]);
  const reply = result.posts.find((post) => post.ref === "x-1-reply-1");
  assert.equal(reply?.kind, "reply");
  assert.equal(reply?.parentRef, "x-1");
  assert.equal(
    result.posts.find((post) => post.ref === "x-1")?.body.split("\n").length,
    3
  );
});

test("reads a block without a fence and with prose after it", () => {
  const { posts } = parsePosts(`Sure! Here you go:
{"campaign": {"name": "Paws launch"}, "posts": [{"ref": "x-1", "platform": "x", "wave": 1, "kind": "post", "language": "en", "body": "A small room.", "hashtags": [], "media": "promo"}]}
Let me know if you want a softer version.`);
  assert.deepEqual(
    posts.map((post) => post.ref),
    ["x-1"]
  );
});

test("tolerates trailing commas, comments, smart quotes and raw line breaks", () => {
  const { posts } = parsePosts(`\`\`\`json
{
  “campaign”: { “name”: “Paws launch”, },
  "posts": [
    {
      "ref": "threads-1", // the launch
      "platform": "threads",
      "wave": "1",
      "kind": "post",
      "language": "en",
      "body": "I made a small room.
You look up at the cats through frosted glass.",
      "hashtags": ["#cats",],
      "target": "Cats of Threads",
      "media": "promo",
    },
    {
      “ref”: “xiaohongshu-1”,
      “platform”: “小红书”,
      “wave”: 1,
      “language”: “zh-CN”,
      “title”: “和陌生人的猫见一面”,
      “body”: “他说“你好”，然后走了。”,
      “hashtags”: “#猫 #数字艺术”,
      “media”: “promo”
    },
  ],
}
\`\`\``);
  assert.deepEqual(
    posts.map((post) => post.ref),
    ["threads-1", "xiaohongshu-1"]
  );
  const threads = posts.at(0);
  assert.equal(
    threads?.body,
    "I made a small room.\nYou look up at the cats through frosted glass."
  );
  assert.equal(threads?.wave, 1);
  assert.deepEqual(threads?.hashtags, ["cats"]);
  assert.equal(threads?.target, "Cats of Threads");
  const xiaohongshu = posts.at(1);
  assert.equal(xiaohongshu?.platformId, "xiaohongshu");
  assert.equal(xiaohongshu?.language, "zh");
  assert.equal(xiaohongshu?.kind, "post");
  assert.equal(xiaohongshu?.body, "他说“你好”，然后走了。");
  assert.deepEqual(xiaohongshu?.hashtags, ["猫", "数字艺术"]);
});

test("keeps smart quotes inside straight-quoted strings", () => {
  const { posts } = parsePosts(`\`\`\`json
{"posts": [{"ref": "x-1", "platform": "X", "body": "Someone’s cat said “hi”.", "hashtags": [],}]}
\`\`\``);
  assert.equal(posts.at(0)?.body, "Someone’s cat said “hi”.");
  assert.equal(posts.at(0)?.platformId, "x");
});

test("reads platform labels and aliases, camelCase parent refs and Reddit targets", () => {
  const { posts } = parsePosts(`\`\`\`json
{"posts": [
  {"ref": "producthunt-1", "platform": "Product Hunt", "title": "Paws", "body": "A room of cats."},
  {"ref": "producthunt-1-comment", "platform": "producthunt", "parentRef": "producthunt-1", "body": "Hi Product Hunt :)"},
  {"ref": "x-1", "platform": "Twitter", "body": "A small room."},
  {"ref": "x-1-reply-1", "platform": "x", "parent_ref": "x-1", "body": "paws.garden"},
  {"ref": "reddit-1", "platform": "reddit", "target": "SideProject", "title": "I made a room", "body": "Hi everyone"}
]}
\`\`\``);
  assert.deepEqual(
    posts.map((post) => [post.ref, post.platformId, post.kind]),
    [
      ["producthunt-1", "producthunt", "post"],
      ["producthunt-1-comment", "producthunt", "comment"],
      ["x-1", "x", "post"],
      ["x-1-reply-1", "x", "reply"],
      ["reddit-1", "reddit", "post"],
    ]
  );
  assert.equal(posts.at(1)?.parentRef, "producthunt-1");
  assert.equal(posts.at(4)?.target, "r/SideProject");
  assert.equal(posts.at(4)?.media, "none");
});

test("skips posts it cannot read and duplicate refs, with a warning each", () => {
  const { posts, warnings } = parsePosts(`\`\`\`json
{"posts": [
  {"ref": "x-1", "platform": "x", "body": "First."},
  {"ref": "x-1", "platform": "x", "body": "Second."},
  {"platform": "x", "body": "No ref."},
  {"ref": "mastodon-1", "platform": "mastodon", "body": "Hello"},
  {"ref": "threads-1", "platform": "threads", "body": "  "},
  "not a post"
]}
\`\`\``);
  assert.deepEqual(
    posts.map((post) => post.body),
    ["First."]
  );
  assert.deepEqual(warnings, [
    "Post 3 has no ref; skipped.",
    "mastodon-1 has an unknown platform; skipped.",
    "threads-1 has no body; skipped.",
    "Post 6 is not an object; skipped.",
    "x-1 appears more than once; kept the first.",
  ]);
});

test("returns an error when there is no JSON or it cannot be read", () => {
  assert.deepEqual(parseSmartCampaignResponse("I can't help with that."), {
    kind: "error",
    message: "No JSON block found in the reply.",
  });
  assert.equal(
    parseSmartCampaignResponse('```json\n{"posts": [ {"ref": }\n```').kind,
    "error"
  );
  assert.deepEqual(parseSmartCampaignResponse('{"campaign": {}}'), {
    kind: "error",
    message: "The JSON has no `posts` list.",
  });
});

test("reads unescaped inner quotes, escapes in smart-quoted strings and a comment after the last value", () => {
  const { posts } = parsePosts(`\`\`\`json
{"posts": [
  {"ref": "x-1", "platform": "x", "body": "I called it "Paws", because cats", "why": "last value" // a note
  },
  {“ref”: “x-2”, “platform”: “x”, “body”: “a \\"b\\" c”}
]}
\`\`\``);
  assert.deepEqual(
    posts.map((post) => post.body),
    ['I called it "Paws", because cats', 'a "b" c']
  );
});

test("reads the last JSON fence when the reply repeats the example first", () => {
  const { posts } = parsePosts(`Example of the shape:
\`\`\`json
{"campaign": {"name": "…"}, "posts": []}
\`\`\`
${PAWS_CHATGPT_REPLY}`);
  assert.equal(posts.length, 7);
});

test("warns once about a ref that appears three times", () => {
  const { posts, warnings } = parsePosts(`\`\`\`json
{"posts": [
  {"ref": "x-1", "platform": "x", "body": "First."},
  {"ref": "x-1", "platform": "x", "body": "Second."},
  {"ref": "x-1", "platform": "x", "body": "Third."}
]}
\`\`\``);
  assert.deepEqual(
    posts.map((post) => post.body),
    ["First."]
  );
  assert.deepEqual(warnings, ["x-1 appears more than once; kept the first."]);
});
