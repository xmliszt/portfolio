import assert from "node:assert/strict";
import { test } from "node:test";

import { getMeowUrl } from "./get-meow-url";

test("names the static file by age, voice and mood", () => {
  assert.equal(
    getMeowUrl({ age: "kitten", voice: "squeaky", mood: "sleepy" }),
    "/paws/sounds/meow-kitten-squeaky-sleepy.mp3"
  );
});
