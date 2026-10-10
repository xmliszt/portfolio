/** Return the basket's tooltip for `count` of `total` garments in it. */
export function describeHamperBasket(options: {
  count: number;
  total: number;
}) {
  if (options.count === 0) return "toss the clothes from the floor in here";
  if (options.count < options.total) {
    return `${options.count} of ${options.total} in · add more, or head to the door`;
  }
  return "all in · head to the door";
}
