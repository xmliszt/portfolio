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
      characters: number;
    }
  | { kind: "pause"; long: boolean; characters: number };

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
    characters: 1,
  };
}

/** Return the syllables a cat babbles for `text`: one per letter or other character, a short pause for whitespace, a long pause for punctuation such as `.`, `,` or `?`, a rise over the last syllables before `?`, louder syllables in capitals or throughout a line ending in `!`, and at most `MAX_SYLLABLES`; each syllable counts the `characters` of `text` it covers, symbols included. */
export function getBabbleSyllables(text: string): BabbleSyllable[] {
  const sounds = Array.from(text).map(
    (character): BabbleSyllable | undefined => {
      if (/\s/u.test(character))
        return { kind: "pause", long: false, characters: 1 };
      if (/[.,;:…。、，！？!?]/u.test(character))
        return { kind: "pause", long: true, characters: 1 };
      if (/[\p{P}\p{S}]/u.test(character)) return undefined;
      return toVoiced({
        character,
        isUpper:
          character !== character.toLowerCase() &&
          character === character.toUpperCase(),
      });
    }
  );
  const trimmed = sounds.reduce<{ kept: BabbleSyllable[]; skipped: number }>(
    (state, sound) => {
      if (sound === undefined)
        return { kept: state.kept, skipped: state.skipped + 1 };
      const withSkipped = {
        ...sound,
        characters: sound.characters + state.skipped,
      };
      const last = state.kept.at(-1);
      if (withSkipped.kind !== "pause" || last?.kind !== "pause")
        return { kept: [...state.kept, withSkipped], skipped: 0 };
      return {
        kept: [
          ...state.kept.slice(0, -1),
          {
            kind: "pause",
            long: last.long || withSkipped.long,
            characters: last.characters + withSkipped.characters,
          },
        ],
        skipped: 0,
      };
    },
    { kept: [], skipped: 0 }
  );
  const lastKept = trimmed.kept.at(-1);
  const covered =
    lastKept === undefined || trimmed.skipped === 0
      ? trimmed.kept
      : [
          ...trimmed.kept.slice(0, -1),
          { ...lastKept, characters: lastKept.characters + trimmed.skipped },
        ];
  const capped = covered.slice(0, MAX_SYLLABLES);
  const isQuestion = /[?？]\s*$/u.test(text);
  const isExclaimed = /[!！]\s*$/u.test(text);
  const voicedIndexes = capped.flatMap((syllable, index) =>
    syllable.kind === "voiced" ? [index] : []
  );
  const firstRising = voicedIndexes.length - RISE_SYLLABLES;
  return capped.map((syllable, index) => {
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
