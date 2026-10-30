import type { Step } from "@/lib/paws/cat-look";
import type { Age } from "@/lib/paws/voice-settings";

import { hashUserId } from "./hash-user-id";
import type { PawsSound } from "./paws-sound";

const SIZE_RATE = { small: 1.1, medium: 1, large: 0.9 } satisfies {
  [size in Step]: number;
};
const AGE_RATE = { kitten: 1.12, adult: 1, old: 0.9 } satisfies {
  [age in Age]: number;
};
const MAX_OFFSET = 0.04;
const MIN_RATE = 0.75;
const MAX_RATE = 1.35;

/** Return the playback rate for one cat's sound from its size, its age (shared trill and purr only, since meows are made for their age) and a small fixed offset from `userId`. */
export function getCatPlaybackRate(options: {
  sound: PawsSound;
  size: Step;
  age: Age;
  userId: string;
}) {
  const ageRate = options.sound === "meow" ? 1 : AGE_RATE[options.age];
  const offset = (hashUserId(options.userId) * 2 - 1) * MAX_OFFSET;
  const rate = SIZE_RATE[options.size] * ageRate + offset;
  return Math.min(Math.max(rate, MIN_RATE), MAX_RATE);
}
