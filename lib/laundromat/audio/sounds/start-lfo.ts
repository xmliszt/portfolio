/** Start a sine oscillator at `rateHz` scaled to ±`depth` and connect it to `param`. */
export function startLfo(options: {
  context: AudioContext;
  param: AudioParam;
  rateHz: number;
  depth: number;
}) {
  const oscillator = options.context.createOscillator();
  oscillator.frequency.value = options.rateHz;
  const depth = options.context.createGain();
  depth.gain.value = options.depth;
  oscillator.connect(depth).connect(options.param);
  oscillator.start();
  return oscillator;
}
