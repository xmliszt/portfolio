export type NoiseColor = "white" | "pink" | "brown";

function applyKelletPinkFilter(white: number[]) {
  const state = { b0: 0, b1: 0, b2: 0 };
  return white.map((sample) => {
    state.b0 = 0.99765 * state.b0 + sample * 0.099046;
    state.b1 = 0.963 * state.b1 + sample * 0.2965164;
    state.b2 = 0.57 * state.b2 + sample * 1.0526913;
    return (state.b0 + state.b1 + state.b2 + sample * 0.1848) * 0.2;
  });
}

/** Return a mono buffer of `color` noise lasting `durationMs`. */
export function createNoiseBuffer(options: {
  context: BaseAudioContext;
  durationMs: number;
  color: NoiseColor;
}) {
  const { sampleRate } = options.context;
  const length = Math.max(
    1,
    Math.round((sampleRate * options.durationMs) / 1000)
  );
  const buffer = options.context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  const white = Array.from({ length }, () => Math.random() * 2 - 1);
  switch (options.color) {
    case "white":
      data.set(white);
      return buffer;
    case "pink":
      data.set(applyKelletPinkFilter(white));
      return buffer;
    case "brown": {
      const state = { last: 0 };
      white.forEach((sample, index) => {
        state.last = (state.last + 0.02 * sample) / 1.02;
        data[index] = state.last * 3.5;
      });
      return buffer;
    }
    default: {
      const unknownColor: never = options.color;
      throw new Error(`Unknown noise color ${String(unknownColor)}`);
    }
  }
}
