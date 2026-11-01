import type { PlatformId } from "./platforms";

const X_URL_WEIGHT = 23;
const X_EMOJI_WEIGHT = 2;

/** Code point ranges X counts as 1; every other code point counts as 2. */
const X_LIGHT_RANGES = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
] as const;

const URL_PATTERN =
  /https?:\/\/\S+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?![a-z0-9-])(?:\/\S*)?/gi;

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function getXGraphemeWeight(grapheme: string) {
  if (/\p{Extended_Pictographic}/u.test(grapheme)) {
    return X_EMOJI_WEIGHT;
  }
  return Array.from(grapheme).reduce((sum, character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    const isLight = X_LIGHT_RANGES.some(
      ([start, end]) => codePoint >= start && codePoint <= end
    );
    return sum + (isLight ? 1 : 2);
  }, 0);
}

/** Return the length of `text` as `platformId` counts it toward its limit. */
export function countPostCharacters(options: {
  text: string;
  platformId: PlatformId;
}) {
  if (options.platformId !== "x") {
    return Array.from(segmenter.segment(options.text)).length;
  }
  const urlCount = options.text.match(URL_PATTERN)?.length ?? 0;
  const withoutUrls = options.text.replace(URL_PATTERN, "");
  return Array.from(segmenter.segment(withoutUrls)).reduce(
    (sum, { segment }) => sum + getXGraphemeWeight(segment),
    urlCount * X_URL_WEIGHT
  );
}
