import { createLoopHandle } from "./create-loop-handle";
import { createLoopOutput } from "./create-loop-output";
import { startLfo } from "./start-lfo";
import type { LoopHandle, VoiceOptions } from "./voice-options";

/** Start the steady whir of a receipt printer motor pulling paper in, its pitch fluttering slightly. */
export function startPrinterMotor(
  options: VoiceOptions & { fadeInMs: number }
): LoopHandle {
  const { context } = options;
  const output = createLoopOutput({
    context,
    destination: options.destination,
    level: options.volume,
    fadeInMs: options.fadeInMs,
  });
  const motor = context.createOscillator();
  motor.type = "sawtooth";
  motor.frequency.value = 240;
  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1400;
  band.Q.value = 1.6;
  const motorGain = context.createGain();
  motorGain.gain.value = 0.05;
  motor.connect(band).connect(motorGain).connect(output);
  motor.start();
  const flutter = startLfo({
    context,
    param: motor.frequency,
    rateHz: 31,
    depth: 6,
  });
  return createLoopHandle({
    context,
    output,
    sources: [motor, flutter],
    events: [],
  });
}
