import assert from "node:assert/strict";
import { test } from "node:test";

import { countPostCharacters } from "./count-post-characters";

const X_POST = `I made a small room on the Internet where strangers meet through their cats 🐾

You look up at them through frosted glass, so everything is soft and hazy. I've always felt some things are more real when you can't see every detail. Maybe people are too.

paws.garden`;

const THREADS_POST = `I made a small room on the Internet where strangers meet through their cats 🐾

I love Impressionist paintings and the grain of risograph prints. Things feel more real to me when I can't see every detail, and I wonder if meeting people is like that too. So in Paws you look up at everyone's cats through frosted glass.

You won't know whose cat it is. But one might wander over and press its paw to your fingertip, and that's all.

paws.garden`;

test("counts the Paws X post the way X does", () => {
  assert.equal(countPostCharacters({ text: X_POST, platformId: "x" }), 277);
});

test("counts every URL on X as 23", () => {
  assert.equal(
    countPostCharacters({
      text: "see https://paws.garden/about?a=1 and laundro.cafe",
      platformId: "x",
    }),
    4 + 23 + 5 + 23
  );
  assert.equal(
    countPostCharacters({ text: "Internet. Maybe e.g.", platformId: "x" }),
    20
  );
});

test("counts emoji and CJK as 2 on X", () => {
  assert.equal(countPostCharacters({ text: "你好🐾", platformId: "x" }), 6);
  assert.equal(countPostCharacters({ text: "👩‍👩‍👧", platformId: "x" }), 2);
});

test("counts graphemes on other platforms", () => {
  assert.equal(
    countPostCharacters({ text: "你好🐾 paws.garden", platformId: "threads" }),
    15
  );
  assert.equal(
    countPostCharacters({ text: THREADS_POST, platformId: "threads" }),
    442
  );
});
