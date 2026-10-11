import type { NoiseColor } from "./create-noise-buffer";
import { createNoiseBuffer } from "./create-noise-buffer";

/** Start a looping 4-second `color` noise source and return it unconnected. */
export function startLoopedNoise(options: {
  context: AudioContext;
  color: NoiseColor;
}) {
  const source = options.context.createBufferSource();
  source.buffer = createNoiseBuffer({
    context: options.context,
    durationMs: 4000,
    color: options.color,
  });
  source.loop = true;
  source.start(options.context.currentTime, Math.random() * 4);
  return source;
}
