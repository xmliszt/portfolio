import type { Step } from "@/lib/paws/cat-look";
import { getBabbleSyllables } from "@/lib/paws/sound/get-babble-syllables";
import { getBabbleTimes } from "@/lib/paws/sound/get-babble-times";
import { getBabbleVoice } from "@/lib/paws/sound/get-babble-voice";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

export type RevealStep = { characters: number; atMs: number };

/** Return when each part of `text` shows in a bubble, in step with the cat babbling it: the characters shown so far as each syllable starts, then all of `text` when the babble ends. */
export function getRevealSteps(options: {
  text: string;
  voice: VoiceSettings;
  size: Step;
  userId: string;
}): RevealStep[] {
  const syllables = getBabbleSyllables(options.text);
  const times = getBabbleTimes({
    syllables,
    syllableSeconds: getBabbleVoice(options).syllableSeconds,
  });
  const steps = syllables.reduce<RevealStep[]>(
    (list, syllable, index) => [
      ...list,
      {
        characters: (list.at(-1)?.characters ?? 0) + syllable.characters,
        atMs: times.startsAt[index] * 1000,
      },
    ],
    []
  );
  return [
    ...steps,
    { characters: Array.from(options.text).length, atMs: times.endsAt * 1000 },
  ];
}
