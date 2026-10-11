/** Return the stroke class for a drawn part: bright when `highlighted`, otherwise the object line colour. */
export function partStroke(highlighted: boolean) {
  return highlighted ? "stroke-[var(--lm-ink-hi)]" : "stroke-[var(--lm-line)]";
}
