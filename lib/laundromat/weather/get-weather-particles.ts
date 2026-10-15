function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Return `count` points scattered at random over the unit square, each with `across` and `up` in [0, 1) and a `size` in [0, 1), the same for the same `seed`. */
export function getWeatherParticles(options: { count: number; seed: number }) {
  const random = createRandom(options.seed);
  return Array.from({ length: options.count }, () => ({
    across: random(),
    up: random(),
    size: random(),
  }));
}
