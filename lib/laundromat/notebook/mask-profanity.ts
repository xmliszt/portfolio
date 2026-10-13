import escapeRegExp from "lodash/escapeRegExp.js";
import {
  DataSet,
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";

import { PROFANITY_WORDS } from "./profanity-words";

const MASK = "*";

const englishTerms = new DataSet<{ originalWord: string }>()
  .addAll(englishDataset)
  // Common words in the other site languages, or everyday English, that the English dataset counts as swears.
  .removePhrasesIf((phrase) =>
    ["negro", "abo", "sex", "tit", "anal", "dick"].includes(
      phrase.metadata?.originalWord ?? ""
    )
  )
  .build();

const englishMatcher = new RegExpMatcher({
  ...englishTerms,
  whitelistedTerms: [
    ...(englishTerms.whitelistedTerms ?? []),
    "cumpleaños",
    "cumin",
    "cum laude",
    "shiitake",
    "penisola",
    "penistone",
    "pussy willow",
    "pussycat",
    "retardant",
  ],
  ...englishRecommendedTransformers,
});

function toPattern(word: string) {
  return [...new Set([word.normalize("NFC"), word.normalize("NFD")])]
    .map((form) => escapeRegExp(form).replace(/[iıİI]/gu, "[iıİI]"))
    .join("|");
}

function toAlternation(words: string[]) {
  return words
    .toSorted((a, b) => b.length - a.length)
    .map(toPattern)
    .join("|");
}

const wordPattern = new RegExp(
  `(?<![\\p{L}\\p{M}\\p{N}])(?:(?:${toAlternation(PROFANITY_WORDS.wholeWord)})(?:e?s)?|(?:${toAlternation(PROFANITY_WORDS.stems)})[\\p{L}\\p{M}]*)(?![\\p{L}\\p{M}\\p{N}])`,
  "giu"
);
const anywherePattern = new RegExp(PROFANITY_WORDS.anywhere.join("|"), "giu");

/** Return `text` with every swear word replaced by one `*` per UTF-16 code unit. */
export function maskProfanity(text: string) {
  const ranges = [
    ...englishMatcher.getAllMatches(text).map(({ startIndex, endIndex }) => ({
      start: startIndex,
      end: endIndex + 1,
    })),
    ...[wordPattern, anywherePattern].flatMap((pattern) =>
      [...text.matchAll(pattern)].flatMap(({ index, 0: word }) =>
        index === undefined ? [] : [{ start: index, end: index + word.length }]
      )
    ),
  ];
  if (ranges.length === 0) return text;
  return [...text].reduce<{ masked: string; offset: number }>(
    ({ masked, offset }, character) => {
      const isMasked = ranges.some(
        (range) => offset >= range.start && offset < range.end
      );
      return {
        masked: masked + (isMasked ? MASK.repeat(character.length) : character),
        offset: offset + character.length,
      };
    },
    { masked: "", offset: 0 }
  ).masked;
}
