const EMPTY_FILL = 0.08;
const FULL_FILL = 0.9;
const COINS_TO_FILL = 120;

/** Return the fill ratio for `coinCount` coins: `EMPTY_FILL` at zero, rising with the square root of the count, capped at `FULL_FILL`. */
export function getJarFillRatio(coinCount: number) {
  return Math.min(
    FULL_FILL,
    EMPTY_FILL + (FULL_FILL - EMPTY_FILL) * Math.sqrt(coinCount / COINS_TO_FILL)
  );
}
