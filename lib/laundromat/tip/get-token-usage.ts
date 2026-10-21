/** Return a token's `uses`, how many are left after the spends at `spentAts` (never below 0), and the latest of them as `spentAt`. */
export function getTokenUsage(options: { uses: number; spentAts: string[] }) {
  return {
    uses: options.uses,
    usesLeft: Math.max(0, options.uses - options.spentAts.length),
    spentAt: options.spentAts.toSorted().at(-1),
  };
}
