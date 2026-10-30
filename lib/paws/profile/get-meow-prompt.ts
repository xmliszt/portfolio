import type { Age, VoiceSettings } from "@/lib/paws/voice-settings";

const AGE_WORDS = { kitten: "a kitten", adult: "an adult", old: "an old" } satisfies { [age in Age]: string };

/** Return the ElevenLabs sound prompt for a normalized meow text made in `voice`. */
export function getMeowPrompt(options: { normalizedText: string; voice: VoiceSettings }) {
  return `${options.normalizedText}, made by ${AGE_WORDS[options.voice.age]} cat, ${options.voice.voice}, ${options.voice.mood}, one short sound, close mic, no background, no music`;
}
