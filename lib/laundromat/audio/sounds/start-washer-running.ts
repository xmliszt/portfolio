import { createLoopHandle } from "./create-loop-handle";
import { createLoopOutput } from "./create-loop-output";
import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import { scheduleRandomEvents } from "./schedule-random-events";
import { startLfo } from "./start-lfo";
import { startLoopedNoise } from "./start-looped-noise";
import type { LoopHandle, VoiceOptions } from "./voice-options";

const HUM_PARTIALS = [
  { frequencyHz: 55, level: 0.05, type: "sine" },
  { frequencyHz: 110, level: 0.022, type: "sine" },
  { frequencyHz: 165, level: 0.008, type: "triangle" },
] satisfies { frequencyHz: number; level: number; type: OscillatorType }[];

/** Start a running washer: a low motor hum, slowly swelling water slosh, and a soft tumble every 1.2 to 2.4 seconds. */
export function startWasherRunning(
  options: VoiceOptions & { fadeInMs: number }
): LoopHandle {
  const { context } = options;
  const output = createLoopOutput({
    context,
    destination: options.destination,
    level: options.volume,
    fadeInMs: options.fadeInMs,
  });

  const humFilter = context.createBiquadFilter();
  humFilter.type = "lowpass";
  humFilter.frequency.value = 400;
  humFilter.connect(output);
  const humOscillators = HUM_PARTIALS.map((partial) => {
    const oscillator = context.createOscillator();
    oscillator.type = partial.type;
    oscillator.frequency.value = partial.frequencyHz;
    const gain = context.createGain();
    gain.gain.value = partial.level;
    oscillator.connect(gain).connect(humFilter);
    oscillator.start();
    return oscillator;
  });
  const humWobble = humOscillators.map((oscillator) =>
    startLfo({
      context,
      param: oscillator.frequency,
      rateHz: jitter({ value: 0.25, amount: 0.3 }),
      depth: 0.4,
    })
  );

  const slosh = startLoopedNoise({ context, color: "brown" });
  const sloshFilter = context.createBiquadFilter();
  sloshFilter.type = "lowpass";
  sloshFilter.frequency.value = 650;
  const sloshGain = context.createGain();
  sloshGain.gain.value = 0.05;
  slosh.connect(sloshFilter).connect(sloshGain).connect(output);
  const sloshSwell = startLfo({
    context,
    param: sloshGain.gain,
    rateHz: jitter({ value: 0.4, amount: 0.2 }),
    depth: 0.035,
  });
  const sloshSweep = startLfo({
    context,
    param: sloshFilter.frequency,
    rateHz: 0.17,
    depth: 220,
  });

  const tumbles = scheduleRandomEvents({
    context,
    minIntervalMs: 1200,
    maxIntervalMs: 2400,
    onEvent: (startTimeS) => {
      playNoiseBurst({
        context,
        destination: output,
        startTimeS,
        color: "brown",
        filterType: "lowpass",
        frequencyHz: jitter({ value: 700, amount: 0.2 }),
        endFrequencyHz: 300,
        q: 0.8,
        attackMs: 220,
        decayMs: 480,
        peak: jitter({ value: 0.07, amount: 0.25 }),
      });
      playTone({
        context,
        destination: output,
        startTimeS: startTimeS + 0.18,
        type: "sine",
        frequencyHz: jitter({ value: 72, amount: 0.1 }),
        endFrequencyHz: 50,
        attackMs: 8,
        decayMs: 130,
        peak: jitter({ value: 0.05, amount: 0.3 }),
      });
    },
  });

  return createLoopHandle({
    context,
    output,
    sources: [...humOscillators, ...humWobble, slosh, sloshSwell, sloshSweep],
    events: [tumbles],
  });
}
