import { createLoopHandle } from "./create-loop-handle";
import { createLoopOutput } from "./create-loop-output";
import type { LoopHandle, VoiceOptions } from "./voice-options";

const MP3_PADDING_S = 0.02;

/** Start looping `buffer` from a random point, fading in to `volume` over `fadeInMs`. */
export function startSampleLoop(
  options: VoiceOptions & { buffer: AudioBuffer; fadeInMs: number }
): LoopHandle {
  const { context } = options;
  const output = createLoopOutput({
    context,
    destination: options.destination,
    level: options.volume,
    fadeInMs: options.fadeInMs,
  });
  const source = context.createBufferSource();
  source.buffer = options.buffer;
  source.loop = true;
  source.loopStart = MP3_PADDING_S;
  source.loopEnd = options.buffer.duration - MP3_PADDING_S;
  source.connect(output);
  source.start(context.currentTime, Math.random() * options.buffer.duration);
  return createLoopHandle({ context, output, sources: [source], events: [] });
}
