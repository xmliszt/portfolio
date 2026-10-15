import { createLoopHandle } from "./create-loop-handle";
import { createLoopOutput } from "./create-loop-output";
import { createNoiseBuffer } from "./create-noise-buffer";
import { jitter } from "./jitter";
import { playTone } from "./play-tone";
import { randomBetween } from "./random-between";
import { scheduleRandomEvents } from "./schedule-random-events";
import { startLfo } from "./start-lfo";
import { startLoopedNoise } from "./start-looped-noise";
import type { LoopHandle, VoiceOptions } from "./voice-options";

const TICK_BUFFER_MS = 400;
const TICK_LENGTH_S = 0.1;

/** Start rain outside a window: separate drops hitting hard ground at random places left to right, a fainter patter of farther drops, taps on the glass, now and then a drop plinking into a puddle, and a quiet hiss and wash under them. */
export function startRainOutside(
  options: VoiceOptions & { fadeInMs: number }
): LoopHandle {
  const { context } = options;
  const output = createLoopOutput({
    context,
    destination: options.destination,
    level: options.volume,
    fadeInMs: options.fadeInMs,
  });

  const hiss = startLoopedNoise({ context, color: "pink" });
  const hissBand = context.createBiquadFilter();
  hissBand.type = "bandpass";
  hissBand.frequency.value = 2400;
  hissBand.Q.value = 0.4;
  const hissGain = context.createGain();
  hissGain.gain.value = 0.012;
  hiss.connect(hissBand).connect(hissGain).connect(output);
  const hissSwell = startLfo({
    context,
    param: hissGain.gain,
    rateHz: jitter({ value: 0.07, amount: 0.3 }),
    depth: 0.004,
  });

  const wash = startLoopedNoise({ context, color: "brown" });
  const washFilter = context.createBiquadFilter();
  washFilter.type = "lowpass";
  washFilter.frequency.value = 500;
  const washGain = context.createGain();
  washGain.gain.value = 0.02;
  wash.connect(washFilter).connect(washGain).connect(output);

  const tickNoise = createNoiseBuffer({
    context,
    durationMs: TICK_BUFFER_MS,
    color: "white",
  });
  function playTick(options: {
    startTimeS: number;
    frequencyHz: number;
    q: number;
    decayS: number;
    peak: number;
    pan: number;
  }) {
    const source = context.createBufferSource();
    source.buffer = tickNoise;
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = options.frequencyHz;
    band.Q.value = options.q;
    const gain = context.createGain();
    gain.gain.setValueAtTime(options.peak, options.startTimeS);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      options.startTimeS + options.decayS
    );
    const panner = context.createStereoPanner();
    panner.pan.value = options.pan;
    source.connect(band).connect(gain).connect(panner).connect(output);
    source.start(
      options.startTimeS,
      Math.random() * (TICK_BUFFER_MS / 1000 - TICK_LENGTH_S),
      TICK_LENGTH_S
    );
    source.onended = () => gain.disconnect();
  }

  const impacts = scheduleRandomEvents({
    context,
    minIntervalMs: 25,
    maxIntervalMs: 110,
    onEvent: (startTimeS) => {
      const pan = randomBetween({ min: -0.7, max: 0.7 });
      const peak = 0.012 + 0.09 * Math.random() ** 2.5;
      playTick({
        startTimeS,
        frequencyHz: randomBetween({ min: 500, max: 1500 }),
        q: randomBetween({ min: 0.9, max: 1.8 }),
        decayS: randomBetween({ min: 0.03, max: 0.07 }),
        peak,
        pan,
      });
      playTick({
        startTimeS,
        frequencyHz: randomBetween({ min: 3000, max: 6000 }),
        q: 3,
        decayS: randomBetween({ min: 0.005, max: 0.012 }),
        peak: peak * 0.5,
        pan,
      });
    },
  });
  const farPatter = scheduleRandomEvents({
    context,
    minIntervalMs: 20,
    maxIntervalMs: 80,
    onEvent: (startTimeS) =>
      playTick({
        startTimeS,
        frequencyHz: randomBetween({ min: 1500, max: 4000 }),
        q: randomBetween({ min: 1.5, max: 4 }),
        decayS: randomBetween({ min: 0.008, max: 0.02 }),
        peak: randomBetween({ min: 0.002, max: 0.01 }),
        pan: randomBetween({ min: -1, max: 1 }),
      }),
  });
  const glassTaps = scheduleRandomEvents({
    context,
    minIntervalMs: 90,
    maxIntervalMs: 420,
    onEvent: (startTimeS) =>
      playTick({
        startTimeS,
        frequencyHz: randomBetween({ min: 3500, max: 5500 }),
        q: 9,
        decayS: randomBetween({ min: 0.02, max: 0.045 }),
        peak: randomBetween({ min: 0.015, max: 0.045 }),
        pan: randomBetween({ min: -0.4, max: 0.4 }),
      }),
  });
  const plinks = scheduleRandomEvents({
    context,
    minIntervalMs: 250,
    maxIntervalMs: 1400,
    onEvent: (startTimeS) => {
      const frequencyHz = randomBetween({ min: 700, max: 2200 });
      playTone({
        context,
        destination: output,
        startTimeS,
        type: "sine",
        frequencyHz,
        endFrequencyHz: frequencyHz * randomBetween({ min: 1.4, max: 2.1 }),
        glideMs: 18,
        attackMs: 1,
        decayMs: randomBetween({ min: 25, max: 70 }),
        peak: randomBetween({ min: 0.006, max: 0.022 }),
      });
    },
  });

  return createLoopHandle({
    context,
    output,
    sources: [hiss, hissSwell, wash],
    events: [impacts, farPatter, glassTaps, plinks],
  });
}
