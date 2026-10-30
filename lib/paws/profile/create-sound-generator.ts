import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { classifyProviderError } from "./classify-provider-error";
import type { GenerateResult, SoundGenerator } from "./meow-pipeline-types";
import type { MeowProvidersConfig } from "./read-meow-providers-config";

const SOUND_GENERATION_URL = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128";
const DURATION_SECONDS = 1.5;
const PROMPT_INFLUENCE = 0.6;
const TIMEOUT_MS = 25_000;

async function generateWithElevenLabs(options: {
  apiKey: string;
  prompt: string;
  fetch: typeof fetch;
}): Promise<GenerateResult> {
  const response = await options.fetch(SOUND_GENERATION_URL, {
    method: "POST",
    headers: { "xi-api-key": options.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: options.prompt,
      duration_seconds: DURATION_SECONDS,
      prompt_influence: PROMPT_INFLUENCE,
      model_id: "eleven_text_to_sound_v2",
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.ok) return { kind: "audio", bytes: new Uint8Array(await response.arrayBuffer()) };
  const body = await response.text();
  switch (classifyProviderError({ status: response.status, body })) {
    case "refusedByProvider":
      return { kind: "refused", status: response.status, body };
    case "failed":
      return { kind: "failed", detail: `ElevenLabs ${response.status}: ${body}` };
  }
}

/** Return the sound generator for `config`: ElevenLabs Sound Effects, or a fake that returns the pre-made meow for the voice. */
export function createSoundGenerator(options: {
  config: MeowProvidersConfig["generator"];
  fetch: typeof fetch;
  readFallbackClip: (voice: VoiceSettings) => Promise<Uint8Array>;
}): SoundGenerator {
  const config = options.config;
  switch (config.kind) {
    case "elevenLabs":
      return {
        generate: async (request) =>
          generateWithElevenLabs({ apiKey: config.apiKey, prompt: request.prompt, fetch: options.fetch }),
      };
    case "fake":
      return { generate: async (request) => ({ kind: "audio", bytes: await options.readFallbackClip(request.voice) }) };
    default: {
      const unknownConfig: never = config;
      throw new Error(`Unknown generator config ${String(unknownConfig)}`);
    }
  }
}
