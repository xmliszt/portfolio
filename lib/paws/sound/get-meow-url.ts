import type { VoiceSettings } from "@/lib/paws/voice-settings";

/** Return the path of the recorded meow for `voice`. */
export function getMeowUrl(voice: VoiceSettings) {
  return `/paws/sounds/meow-${voice.age}-${voice.voice}-${voice.mood}.mp3`;
}
