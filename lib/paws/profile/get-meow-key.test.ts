import assert from "node:assert/strict";
import { test } from "node:test";

import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { getMeowKey } from "./get-meow-key";

const voice = {
  age: "adult",
  voice: "soft",
  mood: "chatty",
} satisfies VoiceSettings;

test("returns the same 32-character key for the same text and voice", () => {
  const key = getMeowKey({ normalizedText: "meow", voice });
  assert.match(key, /^[0-9a-f]{32}$/);
  assert.equal(
    getMeowKey({ normalizedText: "meow", voice: { ...voice } }),
    key
  );
});

test("changes with the text or any voice field", () => {
  const key = getMeowKey({ normalizedText: "meow", voice });
  assert.notEqual(getMeowKey({ normalizedText: "mew", voice }), key);
  assert.notEqual(
    getMeowKey({ normalizedText: "meow", voice: { ...voice, mood: "sleepy" } }),
    key
  );
});
