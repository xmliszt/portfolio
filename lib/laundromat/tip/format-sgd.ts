/** Return `cents` as Singapore dollars, without decimals when the amount is whole: `S$5` or `S$2.50`. */
export function formatSgd(cents: number) {
  const dollars = cents / 100;
  return `S$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}
