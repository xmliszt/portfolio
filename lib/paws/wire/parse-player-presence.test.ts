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
  ears: "medium",
};
const voice = { age: "kitten", voice: "squeaky", mood: "chatty" };
const MEOW_ORIGINS = ["https://cdn.example"];

test("reads a player's presence", () => {
  assert.deepEqual(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice,
        meowUrl: "https://cdn.example/meow.mp3",
        joinedAt: 10,
        extra: 1,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    {
      userId: "u",
      look,
      voice,
      meowUrl: "https://cdn.example/meow.mp3",
      joinedAt: 10,
    }
  );
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice,
        meowUrl: "/paws/meow.mp3",
        joinedAt: 10,
      },
      meowOrigins: MEOW_ORIGINS,
    })?.meowUrl,
    "/paws/meow.mp3"
  );
});

test("drops a presence with a meow URL that is neither a same-site path nor from a meow origin", () => {
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice,
        meowUrl: "javascript:alert(1)",
        joinedAt: 10,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice,
        meowUrl: "//evil.example/a",
        joinedAt: 10,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice,
        meowUrl: "https://evil.example/a.mp3",
        joinedAt: 10,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice,
        meowUrl: "https://cdn.example.evil/a.mp3",
        joinedAt: 10,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice,
        meowUrl: `https://cdn.example/${"a".repeat(600)}`,
        joinedAt: 10,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
});

test("drops a presence with an unknown look or voice option", () => {
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look: { ...look, coat: "neon" },
        voice,
        meowUrl: "/m",
        joinedAt: 1,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      value: {
        userId: "u",
        look,
        voice: { ...voice, mood: "angry" },
        meowUrl: "/m",
        joinedAt: 1,
      },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      value: { userId: "u", look, voice, meowUrl: "/m", joinedAt: Infinity },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
  assert.equal(
    parsePlayerPresence({
      value: { userId: "", look, voice, meowUrl: "/m", joinedAt: 1 },
      meowOrigins: MEOW_ORIGINS,
    }),
    undefined
  );
});
