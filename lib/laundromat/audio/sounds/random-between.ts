/** Return a number in `[min, max)` drawn from `random`, which defaults to `Math.random`. */
export function randomBetween(options: {
  min: number;
  max: number;
  random?: () => number;
}) {
  const random = options.random ?? Math.random;
  return options.min + (options.max - options.min) * random();
}
