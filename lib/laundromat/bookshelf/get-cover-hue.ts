/** Return a hue from 0 to 359 for a generated cover, the same for the same `text` every time. */
export function getCoverHue(text: string) {
  return [...text].reduce(
    (hash, char) => (hash * 31 + (char.codePointAt(0) ?? 0)) % 360,
    7
  );
}
