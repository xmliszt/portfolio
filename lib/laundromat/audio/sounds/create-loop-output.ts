/** Return a gain node connected to `destination` that fades from silence to `level` over `fadeInMs`. */
export function createLoopOutput(options: {
  context: AudioContext;
  destination: AudioNode;
  level: number;
  fadeInMs: number;
}) {
  const output = options.context.createGain();
  const nowS = options.context.currentTime;
  output.gain.setValueAtTime(0, nowS);
  output.gain.linearRampToValueAtTime(
    options.level,
    nowS + options.fadeInMs / 1000
  );
  output.connect(options.destination);
  return output;
}
