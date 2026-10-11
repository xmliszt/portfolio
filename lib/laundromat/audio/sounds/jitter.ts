import { randomBetween } from "./random-between";

/** Return `value` scaled by a random factor in `[1 - amount, 1 + amount)`, using `random` (default `Math.random`). */
export function jitter(options: {
  value: number;
  amount: number;
  random?: () => number;
}) {
  return (
    options.value *
    randomBetween({
      min: 1 - options.amount,
      max: 1 + options.amount,
      random: options.random,
    })
  );
}
