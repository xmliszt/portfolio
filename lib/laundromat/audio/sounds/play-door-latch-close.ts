import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play a porthole door shutting: a low falling thunk, a soft rubber-seal thud, then the latch catching. */
export function playDoorLatchClose(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const latchTimeS = startTimeS + jitter({ value: 0.05, amount: 0.2 });
  playTone({
    ...options,
    startTimeS,
    type: "sine",
    frequencyHz: jitter({ value: 95, amount: 0.06 }),
    endFrequencyHz: 55,
    glideMs: 90,
    attackMs: 2,
    decayMs: 150,
    peak: 0.3 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: jitter({ value: 420, amount: 0.1 }),
    endFrequencyHz: 180,
    q: 0.7,
    attackMs: 6,
    decayMs: 120,
    peak: 0.28 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: latchTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 3800, amount: 0.1 }),
    q: 4,
    attackMs: 0.5,
    decayMs: 12,
    peak: 0.14 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: latchTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 1200, amount: 0.1 }),
    q: 3,
    attackMs: 1,
    decayMs: 25,
    peak: 0.1 * options.volume,
  });
}
