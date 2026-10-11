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
  { frequencyHz: 48, level: 0.05 },
  { frequencyHz: 96, level: 0.026 },
  { frequencyHz: 144, level: 0.01 },
];

/** Start a running dryer: a warm motor hum, steady airflow noise, and soft clothes thumps with an occasional button tick. */
export function startDryerRunning(
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
  humFilter.frequency.value = 280;
  humFilter.connect(output);
  const humOscillators = HUM_PARTIALS.map((partial) => {
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = jitter({
      value: partial.frequencyHz,
      amount: 0.01,
    });
    const gain = context.createGain();
    gain.gain.value = partial.level;
    oscillator.connect(gain).connect(humFilter);
    oscillator.start();
    return oscillator;
  });

  const air = startLoopedNoise({ context, color: "pink" });
  const airFilter = context.createBiquadFilter();
  airFilter.type = "bandpass";
  airFilter.frequency.value = 900;
  airFilter.Q.value = 0.5;
  const airGain = context.createGain();
  airGain.gain.value = 0.045;
  air.connect(airFilter).connect(airGain).connect(output);
  const airDrift = startLfo({
    context,
    param: airGain.gain,
    rateHz: 0.13,
    depth: 0.01,
  });

  const thumps = scheduleRandomEvents({
    context,
    minIntervalMs: 900,
    maxIntervalMs: 1800,
    onEvent: (startTimeS) => {
      playNoiseBurst({
        context,
        destination: output,
        startTimeS,
        color: "brown",
        filterType: "lowpass",
        frequencyHz: jitter({ value: 220, amount: 0.2 }),
        q: 0.8,
        attackMs: 6,
        decayMs: jitter({ value: 120, amount: 0.25 }),
        peak: jitter({ value: 0.16, amount: 0.3 }),
      });
      playTone({
        context,
        destination: output,
        startTimeS,
        type: "sine",
        frequencyHz: jitter({ value: 68, amount: 0.12 }),
        endFrequencyHz: 48,
        attackMs: 4,
        decayMs: 110,
        peak: jitter({ value: 0.06, amount: 0.3 }),
      });
      if (Math.random() < 0.25) {
        playNoiseBurst({
          context,
          destination: output,
          startTimeS: startTimeS + 0.03,
          color: "white",
          filterType: "bandpass",
          frequencyHz: jitter({ value: 3000, amount: 0.15 }),
          q: 4,
          attackMs: 0.5,
          decayMs: 9,
          peak: 0.03,
        });
      }
    },
  });

  return createLoopHandle({
    context,
    output,
    sources: [...humOscillators, air, airDrift],
    events: [thumps],
  });
}
