import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play a porthole latch release: a small metallic click with inharmonic pings, then a plastic clack as the door pops. */
export function playDoorLatchOpen(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const clackTimeS = startTimeS + jitter({ value: 0.038, amount: 0.2 });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 4300, amount: 0.1 }),
    q: 5,
    attackMs: 0.5,
    decayMs: 10,
    peak: 0.2 * options.volume,
  });
  [3100, 4730].forEach((frequencyHz) =>
    playTone({
      ...options,
      startTimeS,
      type: "sine",
      frequencyHz: jitter({ value: frequencyHz, amount: 0.04 }),
      attackMs: 0.5,
      decayMs: 45,
      peak: 0.025 * options.volume,
    })
  );
  playNoiseBurst({
    ...options,
    startTimeS: clackTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 1400, amount: 0.1 }),
    q: 2.5,
    attackMs: 1,
    decayMs: 30,
    peak: 0.18 * options.volume,
  });
  playTone({
    ...options,
    startTimeS: clackTimeS,
    type: "triangle",
    frequencyHz: jitter({ value: 320, amount: 0.06 }),
    endFrequencyHz: 260,
    attackMs: 1,
    decayMs: 45,
    peak: 0.06 * options.volume,
  });
}
