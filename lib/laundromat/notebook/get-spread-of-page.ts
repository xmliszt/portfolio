/** Return the spread that shows `page`; spread `n` holds page `2n` on the left (the inside cover for `0`) and page `2n + 1` on the right. */
export function getSpreadOfPage(page: number) {
  return Math.floor(page / 2);
}
