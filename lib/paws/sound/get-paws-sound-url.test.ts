import assert from "node:assert/strict";
import { test } from "node:test";

import { getPawsSoundUrl } from "./get-paws-sound-url";

test("plays the cat's own meow URL", () => {
  assert.equal(
    getPawsSoundUrl({
      sound: "meow",
      userId: "a",
      meowUrl: "https://cdn.test/m.mp3",
    }),
    "https://cdn.test/m.mp3"
  );
});

test("picks one of two shared clips per user, the same every time", () => {
  const urls = Array.from({ length: 20 }, (_, index) => `user-${index}`).map(
    (userId) => getPawsSoundUrl({ sound: "purr", userId, meowUrl: "" })
  );
  urls.forEach((url) => assert.match(url, /^\/paws\/sounds\/purr-[12]\.mp3$/));
  assert.equal(new Set(urls).size, 2);
  assert.equal(
    getPawsSoundUrl({ sound: "trill", userId: "a", meowUrl: "" }),
    getPawsSoundUrl({ sound: "trill", userId: "a", meowUrl: "" })
  );
});

test("every cat shares one lick clip", () => {
  assert.equal(
    getPawsSoundUrl({ sound: "lick", userId: "a", meowUrl: "" }),
    "/paws/sounds/lick.mp3"
  );
});
