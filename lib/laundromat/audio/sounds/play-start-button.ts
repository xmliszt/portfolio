import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play a soft plastic button press and release, followed by a short quiet confirm beep. */
export function playStartButton(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const releaseTimeS = startTimeS + jitter({ value: 0.075, amount: 0.15 });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 2200, amount: 0.1 }),
    q: 1.5,
    attackMs: 0.8,
    decayMs: 16,
    peak: 0.18 * options.volume,
  });
  playTone({
    ...options,
    startTimeS,
    type: "triangle",
    frequencyHz: jitter({ value: 420, amount: 0.05 }),
    attackMs: 1,
    decayMs: 25,
    peak: 0.04 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: releaseTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 2700, amount: 0.1 }),
    q: 1.8,
    attackMs: 0.5,
    decayMs: 10,
    peak: 0.09 * options.volume,
  });
  playTone({
    ...options,
    startTimeS: releaseTimeS + 0.03,
    type: "sine",
    frequencyHz: 1320,
    attackMs: 4,
    holdMs: 40,
    decayMs: 90,
    peak: 0.045 * options.volume,
  });
}
