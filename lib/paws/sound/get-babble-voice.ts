import type { Step } from "@/lib/paws/cat-look";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { hashUserId } from "./hash-user-id";

export type BabbleVoice = {
  /** Playback rate of each recorded letter; above 1 is faster and higher. */
  rate: number;
  /** Time from one letter to the next, in seconds. */
  syllableSeconds: number;
  /** Largest random pitch change per letter, in semitones. */
  wobbleSemitones: number;
  /** Pitch change across the whole line, in semitones from start to end. */
  slideSemitones: number;
};

const BASE_RATE = 2.2;
const AGE = {
  kitten: { rate: 1.25, speed: 1.1 },
  adult: { rate: 1, speed: 1 },
  old: { rate: 0.85, speed: 0.85 },
} as const;
const VOICE_RATE = {
  squeaky: 1.3,
  soft: 1.05,
  raspy: 0.95,
  deep: 0.75,
} as const;
const MOOD = {
  chatty: { speed: 1.15, wobble: 3, slide: 1 },
  sleepy: { speed: 0.75, wobble: 1.2, slide: -3 },
  grumpy: { speed: 1, wobble: 1.5, slide: -1.5 },
} as const;
const SIZE_RATE = { small: 1.08, medium: 1, large: 0.92 } as const satisfies {
  [size in Step]: number;
};
const BASE_SYLLABLE_SECONDS = 0.075;
const MAX_OWN_SHIFT = 0.06;

/** Return how a cat with `voice` and body `size` babbles: how fast and high its letters play, its pace and its pitch movement, with a small fixed shift from `userId` so two cats with the same voice differ. */
export function getBabbleVoice(options: {
  voice: VoiceSettings;
  size: Step;
  userId: string;
}): BabbleVoice {
  const age = AGE[options.voice.age];
  const mood = MOOD[options.voice.mood];
  const ownShift = 1 + (hashUserId(options.userId) * 2 - 1) * MAX_OWN_SHIFT;
  return {
    rate:
      BASE_RATE *
      age.rate *
      VOICE_RATE[options.voice.voice] *
      SIZE_RATE[options.size] *
      ownShift,
    syllableSeconds: BASE_SYLLABLE_SECONDS / (age.speed * mood.speed),
    wobbleSemitones: mood.wobble,
    slideSemitones: mood.slide,
  };
}
