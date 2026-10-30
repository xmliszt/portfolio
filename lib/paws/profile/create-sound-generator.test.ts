import assert from "node:assert/strict";
import { test } from "node:test";

import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { createSoundGenerator } from "./create-sound-generator";

const VOICE = {
  age: "old",
  voice: "deep",
  mood: "sleepy",
} satisfies VoiceSettings;
const readFallbackClip = async () => new Uint8Array([9]);

function elevenLabs(response: () => Response) {
  const sent: { url: string; body: unknown; key: string | null }[] = [];
  const generator = createSoundGenerator({
    config: { kind: "elevenLabs", apiKey: "xi" },
    readFallbackClip,
    fetch: async (input, init) => {
      sent.push({
        url: String(input),
        body: JSON.parse(String(init?.body)),
        key: new Headers(init?.headers).get("xi-api-key"),
      });
      return response();
    },
  });
  return { generator, sent };
}

test("the fake generator returns the fallback clip", async () => {
  const generator = createSoundGenerator({
    config: { kind: "fake" },
    fetch,
    readFallbackClip,
  });
  assert.deepEqual(await generator.generate({ prompt: "p", voice: VOICE }), {
    kind: "audio",
    bytes: new Uint8Array([9]),
  });
});

test("ElevenLabs gets the prompt, a 1.5 second duration and the key header", async () => {
  const { generator, sent } = elevenLabs(
    () => new Response(new Uint8Array([1, 2]))
  );
  assert.deepEqual(await generator.generate({ prompt: "mew", voice: VOICE }), {
    kind: "audio",
    bytes: new Uint8Array([1, 2]),
  });
  assert.equal(sent.at(0)?.key, "xi");
  assert.match(
    sent.at(0)?.url ?? "",
    /^https:\/\/api\.elevenlabs\.io\/v1\/sound-generation/
  );
  assert.deepEqual(sent.at(0)?.body, {
    text: "mew",
    duration_seconds: 1.5,
    prompt_influence: 0.6,
    model_id: "eleven_text_to_sound_v2",
  });
});

test("ElevenLabs policy errors are refusals and other errors are failures", async () => {
  const refused = elevenLabs(
    () =>
      new Response('{"detail":"violates our terms of service policy"}', {
        status: 400,
      })
  );
  assert.equal(
    (await refused.generator.generate({ prompt: "x", voice: VOICE })).kind,
    "refused"
  );
  const failed = elevenLabs(() => new Response("busy", { status: 503 }));
  assert.equal(
    (await failed.generator.generate({ prompt: "x", voice: VOICE })).kind,
    "failed"
  );
});
