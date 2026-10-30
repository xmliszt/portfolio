import assert from "node:assert/strict";
import { test } from "node:test";

import { parseVoiceSettings } from "./parse-voice-settings";

test("keeps only the three voice fields", () => {
  assert.deepEqual(
    parseVoiceSettings({
      age: "old",
      voice: "raspy",
      mood: "grumpy",
      extra: 1,
    }),
    {
      age: "old",
      voice: "raspy",
      mood: "grumpy",
    }
  );
});

test("rejects missing or unknown options", () => {
  assert.equal(parseVoiceSettings({ age: "old", voice: "raspy" }), undefined);
  assert.equal(
    parseVoiceSettings({ age: "puppy", voice: "raspy", mood: "grumpy" }),
    undefined
  );
  assert.equal(parseVoiceSettings(null), undefined);
  assert.equal(parseVoiceSettings("old"), undefined);
});
