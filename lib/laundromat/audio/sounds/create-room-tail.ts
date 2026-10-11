const DELAY_TIMES_MS = [23, 31, 41, 53];

/** Return an `input` node feeding a small bank of damped feedback delays that mix into `destination` at `wet`. */
export function createRoomTail(options: {
  context: AudioContext;
  destination: AudioNode;
  wet: number;
  feedback: number;
  dampingHz: number;
}) {
  const input = options.context.createGain();
  const wet = options.context.createGain();
  wet.gain.value = options.wet / DELAY_TIMES_MS.length;
  wet.connect(options.destination);
  DELAY_TIMES_MS.forEach((delayMs) => {
    const delay = options.context.createDelay(0.1);
    delay.delayTime.value = delayMs / 1000;
    const damping = options.context.createBiquadFilter();
    damping.type = "lowpass";
    damping.frequency.value = options.dampingHz;
    const feedback = options.context.createGain();
    feedback.gain.value = options.feedback;
    input.connect(delay);
    // Web Audio only allows a cycle when it passes through a DelayNode, which this one does.
    delay.connect(damping).connect(feedback).connect(delay);
    damping.connect(wet);
  });
  return input;
}
