import assert from "node:assert/strict";
import { test } from "node:test";

import { getPawsSoundUrl } from "./get-paws-sound-url";

const VOICE = { age: "kitten", voice: "squeaky", mood: "chatty" } as const;

test("plays the recorded meow for the cat's voice", () => {
  assert.equal(
    getPawsSoundUrl({ sound: "meow", userId: "a", voice: VOICE }),
    "/paws/sounds/meow-kitten-squeaky-chatty.mp3"
  );
});

test("picks one of two shared clips per user, the same every time", () => {
  const urls = Array.from({ length: 20 }, (_, index) => `user-${index}`).map(
    (userId) => getPawsSoundUrl({ sound: "purr", userId, voice: VOICE })
  );
  urls.forEach((url) => assert.match(url, /^\/paws\/sounds\/purr-[12]\.mp3$/));
  assert.equal(new Set(urls).size, 2);
  assert.equal(
    getPawsSoundUrl({ sound: "trill", userId: "a", voice: VOICE }),
    getPawsSoundUrl({ sound: "trill", userId: "a", voice: VOICE })
  );
});

test("every cat shares one lick clip", () => {
  assert.equal(
    getPawsSoundUrl({ sound: "lick", userId: "a", voice: VOICE }),
    "/paws/sounds/lick.mp3"
  );
});
