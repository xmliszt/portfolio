import { hashUserId } from "./hash-user-id";

/** The letters there is a recording of in `public/paws/letters`. */
export const RECORDED_LETTERS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "r",
  "s",
  "t",
  "u",
  "v",
  "x",
  "y",
] as const;

export type RecordedLetter = (typeof RECORDED_LETTERS)[number];

export type BabbleSyllable =
  | {
      kind: "voiced";
      letter: RecordedLetter;
      semitones: number;
      loud: boolean;
      characters: number;
    }
  | { kind: "pause"; long: boolean; characters: number };

const MAX_SYLLABLES = 48;
const RISE_SYLLABLES = 3;
const STAND_INS = { q: "k", w: "u", z: "s" } as const satisfies {
  [letter: string]: RecordedLetter;
};

function isRecordedLetter(key: string): key is RecordedLetter {
  return RECORDED_LETTERS.some((letter) => letter === key);
}

function isStandIn(key: string): key is keyof typeof STAND_INS {
  return key in STAND_INS;
}

function toLetter(character: string): RecordedLetter {
  const key = character.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  if (isRecordedLetter(key)) return key;
  if (isStandIn(key)) return STAND_INS[key];
  return RECORDED_LETTERS[
    Math.floor(hashUserId(character) * RECORDED_LETTERS.length)
  ];
}

function toVoiced(options: { character: string; isUpper: boolean }) {
  return {
    kind: "voiced" as const,
    letter: toLetter(options.character),
    semitones: options.isUpper ? 2 : 0,
    loud: options.isUpper,
    characters: 1,
  };
}

/** Return the syllables a cat babbles for `text`: one recorded letter per letter, a stand-in for `q`, `w` and `z`, a letter picked by hash for any other character, a short pause for whitespace, a long pause for punctuation such as `.`, `,` or `?`, a rise over the last syllables before `?`, louder syllables in capitals or throughout a line ending in `!`, and at most `MAX_SYLLABLES`; each syllable counts the `characters` of `text` it covers, symbols included. */
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
