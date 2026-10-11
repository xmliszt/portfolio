import { createLoopHandle } from "./create-loop-handle";
import { createLoopOutput } from "./create-loop-output";
import { startLfo } from "./start-lfo";
import { startLoopedNoise } from "./start-looped-noise";
import type { LoopHandle, VoiceOptions } from "./voice-options";

/** Start the steady hiss of a tv with no signal, its level wavering slightly. */
export function startTvNoSignal(
  options: VoiceOptions & { fadeInMs: number }
): LoopHandle {
  const { context } = options;
  const output = createLoopOutput({
    context,
    destination: options.destination,
    level: options.volume,
    fadeInMs: options.fadeInMs,
  });
  const hiss = startLoopedNoise({ context, color: "white" });
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 1200;
  const hissGain = context.createGain();
  hissGain.gain.value = 0.07;
  hiss.connect(highpass).connect(hissGain).connect(output);
  const waver = startLfo({
    context,
    param: hissGain.gain,
    rateHz: 0.7,
    depth: 0.015,
  });
  return createLoopHandle({
    context,
    output,
    sources: [hiss, waver],
    events: [],
  });
}
