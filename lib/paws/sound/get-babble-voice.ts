import type { Step } from "@/lib/paws/cat-look";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { hashUserId } from "./hash-user-id";

export type BabbleVoice = {
  /** Pitch of a plain syllable, in hertz. */
  pitchHz: number;
  /** Length of one syllable, in seconds. */
  syllableSeconds: number;
  /** Largest random pitch change per syllable, in semitones. */
  wobbleSemitones: number;
  /** Pitch change across the whole line, in semitones from start to end. */
  slideSemitones: number;
  /** 0 clean to 1 rough breath mixed into each syllable. */
  rasp: number;
  /** How far the vowel formants move up, as a multiple. */
  formantScale: number;
};

const BASE_PITCH_HZ = 420;
const AGE = {
  kitten: { pitch: 1.3, speed: 1.1 },
  adult: { pitch: 1, speed: 1 },
  old: { pitch: 0.82, speed: 0.85 },
} as const;
const TIMBRE = {
  squeaky: { pitch: 1.35, rasp: 0, formant: 1.25 },
  soft: { pitch: 1.05, rasp: 0.05, formant: 1.05 },
  raspy: { pitch: 0.95, rasp: 0.45, formant: 1 },
  deep: { pitch: 0.7, rasp: 0.15, formant: 0.85 },
} as const;
const MOOD = {
  chatty: { speed: 1.15, wobble: 3, slide: 1 },
  sleepy: { speed: 0.75, wobble: 1.2, slide: -3 },
  grumpy: { speed: 1, wobble: 1.5, slide: -1.5 },
} as const;
const SIZE_PITCH = { small: 1.08, medium: 1, large: 0.92 } as const satisfies {
  [size in Step]: number;
};
const BASE_SYLLABLE_SECONDS = 0.075;
const MAX_OWN_PITCH_SHIFT = 0.06;

/** Return how a cat with `voice` and body `size` babbles: its pitch, pace and roughness, with a small fixed pitch shift from `userId` so two cats with the same voice differ. */
export function getBabbleVoice(options: {
  voice: VoiceSettings;
  size: Step;
  userId: string;
}): BabbleVoice {
  const age = AGE[options.voice.age];
  const timbre = TIMBRE[options.voice.voice];
  const mood = MOOD[options.voice.mood];
  const ownShift =
    1 + (hashUserId(options.userId) * 2 - 1) * MAX_OWN_PITCH_SHIFT;
  return {
    pitchHz:
      BASE_PITCH_HZ *
      age.pitch *
      timbre.pitch *
      SIZE_PITCH[options.size] *
      ownShift,
    syllableSeconds: BASE_SYLLABLE_SECONDS / (age.speed * mood.speed),
    wobbleSemitones: mood.wobble,
    slideSemitones: mood.slide,
    rasp: timbre.rasp,
    formantScale: timbre.formant * (options.voice.age === "kitten" ? 1.1 : 1),
  };
}
