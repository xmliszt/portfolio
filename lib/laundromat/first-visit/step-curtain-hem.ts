/** Return the hem's distances from the stacked ring and their velocities `dtS` seconds later, each pulled towards the ring above it by a damped spring of angular frequency `omega`. */
export function stepCurtainHem(options: {
  hem: number[];
  velocity: number[];
  rings: number[];
  dtS: number;
  omega: number;
  dampingRatio: number;
}) {
  const { omega, dampingRatio, dtS } = options;
  const velocity = options.hem.map((hem, index) => {
    const pull = omega * omega * (options.rings[index]! - hem);
    const drag = 2 * dampingRatio * omega * options.velocity[index]!;
    return options.velocity[index]! + (pull - drag) * dtS;
  });
  return {
    hem: options.hem.map((hem, index) => hem + velocity[index]! * dtS),
    velocity,
  };
}
