import { createLoopHandle } from "./create-loop-handle";
import { createLoopOutput } from "./create-loop-output";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import { randomBetween } from "./random-between";
import { scheduleRandomEvents } from "./schedule-random-events";
import { startLfo } from "./start-lfo";
import { startLoopedNoise } from "./start-looped-noise";
import type { LoopHandle, VoiceOptions } from "./voice-options";

function playBubblePop(options: {
  context: AudioContext;
  destination: AudioNode;
  startTimeS: number;
}) {
  const frequencyHz = randomBetween({ min: 280, max: 950 });
  playTone({
    ...options,
    type: "sine",
    frequencyHz,
    endFrequencyHz: frequencyHz * randomBetween({ min: 1.3, max: 1.8 }),
    glideMs: 30,
    attackMs: 1,
    decayMs: randomBetween({ min: 25, max: 60 }),
    peak: randomBetween({ min: 0.025, max: 0.07 }),
  });
}

/** Start a brewing coffee machine: a faint steam hiss, irregular bubble pops, and an occasional low gurgle. */
export function startCoffeeBrewing(
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
  const hissHighpass = context.createBiquadFilter();
  hissHighpass.type = "highpass";
  hissHighpass.frequency.value = 3000;
  const hissLowpass = context.createBiquadFilter();
  hissLowpass.type = "lowpass";
  hissLowpass.frequency.value = 7500;
  const hissGain = context.createGain();
  hissGain.gain.value = 0.014;
  hiss.connect(hissHighpass).connect(hissLowpass).connect(hissGain);
  hissGain.connect(output);
  const hissDrift = startLfo({
    context,
    param: hissGain.gain,
    rateHz: 0.3,
    depth: 0.006,
  });

  const bubbleFilter = context.createBiquadFilter();
  bubbleFilter.type = "bandpass";
  bubbleFilter.frequency.value = 700;
  bubbleFilter.Q.value = 0.7;
  bubbleFilter.connect(output);

  const bubbles = scheduleRandomEvents({
    context,
    minIntervalMs: 40,
    maxIntervalMs: 420,
    onEvent: (startTimeS) =>
      playBubblePop({ context, destination: bubbleFilter, startTimeS }),
  });

  const gurgles = scheduleRandomEvents({
    context,
    minIntervalMs: 1500,
    maxIntervalMs: 4000,
    onEvent: (startTimeS) => {
      playNoiseBurst({
        context,
        destination: output,
        startTimeS,
        color: "brown",
        filterType: "bandpass",
        frequencyHz: randomBetween({ min: 220, max: 380 }),
        endFrequencyHz: randomBetween({ min: 400, max: 600 }),
        q: 3,
        attackMs: 30,
        decayMs: randomBetween({ min: 150, max: 300 }),
        peak: randomBetween({ min: 0.08, max: 0.14 }),
      });
    },
  });

  return createLoopHandle({
    context,
    output,
    sources: [hiss, hissDrift],
    events: [bubbles, gurgles],
  });
}
