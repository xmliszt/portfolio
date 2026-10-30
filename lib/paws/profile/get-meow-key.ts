import { createHash } from "node:crypto";

import type { VoiceSettings } from "@/lib/paws/voice-settings";

/** Return the cache key for a normalized meow text and voice: a hex SHA-256 of the text, age, voice and mood, cut to 32 characters. */
export function getMeowKey(options: { normalizedText: string; voice: VoiceSettings }) {
  const source = [options.normalizedText, options.voice.age, options.voice.voice, options.voice.mood].join("|");
  return createHash("sha256").update(source).digest("hex").slice(0, 32);
}
