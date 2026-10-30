import assert from "node:assert/strict";
import { test } from "node:test";

import { readMeowProvidersConfig } from "./read-meow-providers-config";

test("uses fake providers and defaults when no keys are set", () => {
  assert.deepEqual(readMeowProvidersConfig({ ELEVENLABS_API_KEY: " " }), {
    moderation: { kind: "fake" },
    suitability: { kind: "fake" },
    generator: { kind: "fake" },
    dailyCredits: 600,
    hashSecret: "paws-dev-hash-secret",
  });
});

test("uses real providers when their keys are set", () => {
  assert.deepEqual(
    readMeowProvidersConfig({
      OPENAI_API_KEY_PAWS: "sk",
      OPENAI_PAWS_MODEL: "small",
      ELEVENLABS_API_KEY: "xi",
      PAWS_DAILY_CREDITS: "1200",
      PAWS_HASH_SECRET: "h",
    }),
    {
      moderation: { kind: "openai", apiKey: "sk" },
      suitability: { kind: "openai", apiKey: "sk", model: "small" },
      generator: { kind: "elevenLabs", apiKey: "xi" },
      dailyCredits: 1200,
      hashSecret: "h",
    }
  );
});

test("keeps the suitability check fake without a model id", () => {
  const config = readMeowProvidersConfig({ OPENAI_API_KEY_PAWS: "sk" });
  assert.deepEqual(config.moderation, { kind: "openai", apiKey: "sk" });
  assert.deepEqual(config.suitability, { kind: "fake" });
});
