import assert from "node:assert/strict";
import { test } from "node:test";

import { toSavedCat } from "./to-saved-cat";

const LOOK = {
  coat: "ginger",
  pattern: "tabby",
  belly: "cream",
  pads: "pink",
  size: "small",
  fluff: "medium",
  tail: "large",
  ears: "medium",
};
const VOICE = { age: "kitten", voice: "squeaky", mood: "chatty" };
const getPublicUrl = (path: string) => `https://cdn.test/${path}`;

test("uses the own meow's public URL", () => {
  const cat = toSavedCat({
    row: {
      look: LOOK,
      voice: VOICE,
      meows: { storage_path: "meows/k.mp3", blocked: false },
    },
    getPublicUrl,
  });
  assert.equal(cat?.meowUrl, "https://cdn.test/meows/k.mp3");
  assert.equal(cat?.hasOwnMeow, true);
});

test("borrows a meow when the own one is missing or blocked", () => {
  const borrowed = "/paws/sounds/meow-kitten-squeaky-chatty.mp3";
  assert.deepEqual(
    toSavedCat({
      row: { look: LOOK, voice: VOICE, meows: null },
      getPublicUrl,
    }),
    {
      look: LOOK,
      voice: VOICE,
      meowUrl: borrowed,
      hasOwnMeow: false,
    }
  );
  const blocked = toSavedCat({
    row: {
      look: LOOK,
      voice: VOICE,
      meows: { storage_path: "meows/k.mp3", blocked: true },
    },
    getPublicUrl,
  });
  assert.equal(blocked?.meowUrl, borrowed);
  assert.equal(blocked?.hasOwnMeow, true);
});

test("drops a malformed row", () => {
  assert.equal(
    toSavedCat({
      row: { look: { coat: "plaid" }, voice: VOICE },
      getPublicUrl,
    }),
    undefined
  );
  assert.equal(toSavedCat({ row: null, getPublicUrl }), undefined);
});
