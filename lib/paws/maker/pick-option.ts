/** Return the option at `random() * options.length`, clamped to the last option. */
export function pickOption<T>(options: {
  options: readonly T[];
  random: () => number;
}) {
  const index = Math.min(
    Math.floor(options.random() * options.options.length),
    options.options.length - 1
  );
  const option = options.options.at(Math.max(index, 0));
  if (option === undefined)
    throw new Error("pickOption needs at least one option");
  return option;
}
