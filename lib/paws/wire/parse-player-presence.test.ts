import assert from "node:assert/strict";
import { test } from "node:test";

import { parsePlayerPresence } from "./parse-player-presence";

const look = {
  coat: "ginger",
  pattern: "tabby",
  belly: "cream",
  pads: "pink",
  size: "medium",
  fluff: "small",
  tail: "large",
  tailShape: "slim",
  ears: "medium",
};
const voice = { age: "kitten", voice: "squeaky", mood: "chatty" };

test("reads a player's presence and ignores extra fields", () => {
  assert.deepEqual(
    parsePlayerPresence({
      userId: "u",
      connectionId: "c",
      look,
      voice,
      meowUrl: "https://cdn.example/meow.mp3",
      joinedAt: 10,
    }),
    { userId: "u", connectionId: "c", look, voice, joinedAt: 10 }
  );
});

test("drops a presence with an unknown look or voice option", () => {
  assert.equal(
    parsePlayerPresence({
      userId: "u",
      connectionId: "c",
      look: { ...look, coat: "neon" },
      voice,
      joinedAt: 1,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      userId: "u",
      connectionId: "c",
      look,
      voice: { ...voice, mood: "angry" },
      joinedAt: 1,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({ userId: "u", look, voice, joinedAt: Infinity }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({ userId: "", look, voice, joinedAt: 1 }),
    undefined
  );
});
