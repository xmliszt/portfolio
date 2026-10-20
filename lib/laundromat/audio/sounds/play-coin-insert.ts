import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const RATTLE_OFFSETS_S = [0.12, 0.19, 0.24, 0.28, 0.31];

/** Play a coin going into a coin machine: a tick at the slot, a quick rattle down the chute, a soft clunk and a muffled landing in the cash box. */
export function playCoinInsert(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: 5200,
    q: 6,
    attackMs: 0.5,
    decayMs: 18,
    peak: 0.16 * options.volume,
  });
  RATTLE_OFFSETS_S.forEach((offsetS, index) => {
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + offsetS,
      color: "white",
      filterType: "bandpass",
      frequencyHz: jitter({ value: 4200 - index * 300, amount: 0.12 }),
      q: 7,
      attackMs: 0.5,
      decayMs: 10,
      peak: (0.1 - index * 0.012) * options.volume,
    });
  });
  playTone({
    ...options,
    startTimeS: startTimeS + 0.4,
    type: "sine",
    frequencyHz: 150,
    endFrequencyHz: 95,
    attackMs: 2,
    decayMs: 80,
    peak: 0.25 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.7,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: 700,
    q: 0.8,
    attackMs: 2,
    decayMs: 110,
    peak: 0.22 * options.volume,
  });
  playTone({
    ...options,
    startTimeS: startTimeS + 0.71,
    type: "sine",
    frequencyHz: jitter({ value: 2500, amount: 0.05 }),
    attackMs: 1,
    decayMs: 160,
    peak: 0.03 * options.volume,
  });
}
