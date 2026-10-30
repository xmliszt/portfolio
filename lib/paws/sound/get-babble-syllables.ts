import { hashUserId } from "./hash-user-id";

export type BabbleVowel = "a" | "e" | "i" | "o" | "u";
export type BabbleOnset = "none" | "stop" | "hiss" | "hum";

export type BabbleSyllable =
  | {
      kind: "voiced";
      vowel: BabbleVowel;
      onset: BabbleOnset;
      semitones: number;
      loud: boolean;
    }
  | { kind: "pause"; long: boolean };

const MAX_SYLLABLES = 48;
const VOWELS = ["a", "e", "i", "o", "u"] as const;
const ONSETS = ["none", "stop", "hiss", "hum"] as const;
const RISE_SYLLABLES = 3;

/** The vowel and onset of each English letter's name, the way Animalese speaks a letter. */
const LETTERS = {
  a: ["e", "none"],
  b: ["i", "stop"],
  c: ["i", "hiss"],
  d: ["i", "stop"],
  e: ["i", "none"],
  f: ["e", "hiss"],
  g: ["i", "stop"],
  h: ["e", "hiss"],
  i: ["a", "none"],
  j: ["e", "stop"],
  k: ["e", "stop"],
  l: ["e", "hum"],
  m: ["e", "hum"],
  n: ["e", "hum"],
  o: ["o", "none"],
  p: ["i", "stop"],
  q: ["u", "stop"],
  r: ["a", "hum"],
  s: ["e", "hiss"],
  t: ["i", "stop"],
  u: ["u", "none"],
  v: ["i", "hiss"],
  w: ["u", "hum"],
  x: ["e", "hiss"],
  y: ["a", "none"],
  z: ["i", "hiss"],
} as const satisfies { [letter: string]: readonly [BabbleVowel, BabbleOnset] };

function isLetterKey(key: string): key is keyof typeof LETTERS {
  return key in LETTERS;
}

function toVoiced(options: { character: string; isUpper: boolean }) {
  const key = options.character
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  const [vowel, onset] = isLetterKey(key)
    ? LETTERS[key]
    : [
        VOWELS[Math.floor(hashUserId(options.character) * VOWELS.length)],
        ONSETS[Math.floor(hashUserId(`${options.character}~`) * ONSETS.length)],
      ];
  return {
    kind: "voiced" as const,
    vowel,
    onset,
    semitones: options.isUpper ? 2 : 0,
    loud: options.isUpper,
  };
}

/** Return the syllables a cat babbles for `text`: one per letter or other character, a short pause for whitespace, a long pause for punctuation such as `.`, `,` or `?`, a rise over the last syllables before `?`, louder syllables in capitals or throughout a line ending in `!`, and at most `MAX_SYLLABLES`. */
export function getBabbleSyllables(text: string): BabbleSyllable[] {
  const syllables = Array.from(text).flatMap((character): BabbleSyllable[] => {
    if (/\s/u.test(character)) return [{ kind: "pause", long: false }];
    if (/[.,;:…。、，！？!?]/u.test(character))
      return [{ kind: "pause", long: true }];
    if (/[\p{P}\p{S}]/u.test(character)) return [];
    return [
      toVoiced({
        character,
        isUpper:
          character !== character.toLowerCase() &&
          character === character.toUpperCase(),
      }),
    ];
  });
  const trimmed = syllables
    .slice(0, MAX_SYLLABLES)
    .reduce<BabbleSyllable[]>((kept, syllable) => {
      const last = kept.at(-1);
      if (syllable.kind !== "pause" || last?.kind !== "pause")
        return [...kept, syllable];
      return [
        ...kept.slice(0, -1),
        { kind: "pause", long: last.long || syllable.long },
      ];
    }, []);
  const isQuestion = /[?？]\s*$/u.test(text);
  const isExclaimed = /[!！]\s*$/u.test(text);
  const voicedIndexes = trimmed.flatMap((syllable, index) =>
    syllable.kind === "voiced" ? [index] : []
  );
  const firstRising = voicedIndexes.length - RISE_SYLLABLES;
  return trimmed.map((syllable, index) => {
    if (syllable.kind === "pause") return syllable;
    const rank = voicedIndexes.indexOf(index) - firstRising;
    const rise = isQuestion && rank >= 0 ? 2 * (rank + 1) : 0;
    return {
      ...syllable,
      semitones: syllable.semitones + rise,
      loud: syllable.loud || isExclaimed,
    };
  });
}
