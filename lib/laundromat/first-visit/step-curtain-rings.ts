/** Return the ring distances from the stacked ring after the leading ring moves to `leader`, moving each other ring only as far as the fabric forces it: never closer than `minGap` to its neighbour (folds fully bunched) nor farther than `maxGap` (fabric taut). The first ring stays put. */
export function stepCurtainRings(options: {
  rings: number[];
  leader: number;
  minGap: number;
  maxGap: number;
}) {
  const { minGap, maxGap } = options;
  const last = options.rings.length - 1;
  return options.rings.reduceRight<number[]>((next, ring, index) => {
    if (index === last) return [options.leader];
    if (index === 0) return [ring, ...next];
    const pulledBy = next[0]!;
    return [
      Math.min(Math.max(ring, pulledBy - maxGap), pulledBy - minGap),
      ...next,
    ];
  }, []);
}
