/** Return one digit per tube for `count`, right-aligned and capped at the largest number `tubeCount` tubes can show, with `lit` `false` on the leading zeros. */
export function getTubeDigits(options: { count: number; tubeCount: number }) {
  const max = 10 ** options.tubeCount - 1;
  const text = String(Math.min(Math.max(0, Math.floor(options.count)), max));
  const firstLit = options.tubeCount - text.length;
  return text
    .padStart(options.tubeCount, "0")
    .split("")
    .map((char, index) => ({ digit: Number(char), lit: index >= firstLit }));
}
