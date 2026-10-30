import type { VoiceSettings } from "@/lib/paws/voice-settings";

/** Return the path of the shared pre-made meow for `voice`. */
export function getBorrowedMeowUrl(voice: VoiceSettings) {
  return `/paws/sounds/meow-${voice.age}-${voice.voice}-${voice.mood}.mp3`;
}
