import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import type { VoiceOptions } from "./voice-options";

/** Play a wooden room door opening: the handle's latch clack, then a low creak as the door swings. */
export function playRoomDoorOpen(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 2600, amount: 0.1 }),
    q: 4,
    attackMs: 0.5,
    decayMs: 18,
    peak: 0.25 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.05,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: 500,
    q: 0.7,
    attackMs: 1,
    decayMs: 60,
    peak: 0.3 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.18,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 380, amount: 0.1 }),
    endFrequencyHz: 520,
    q: 6,
    attackMs: 120,
    holdMs: 300,
    decayMs: 400,
    peak: 0.08 * options.volume,
  });
}
