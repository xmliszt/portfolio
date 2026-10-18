import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play an instant camera's shutter: a bright blade snap, a short spring ring, then the softer click of the shutter closing. */
export function playCameraShutter(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 3600, amount: 0.08 }),
    q: 1.6,
    attackMs: 0.4,
    decayMs: 18,
    peak: 0.32 * options.volume,
  });
  playTone({
    ...options,
    startTimeS,
    type: "triangle",
    frequencyHz: jitter({ value: 1450, amount: 0.05 }),
    attackMs: 0.5,
    decayMs: 40,
    peak: 0.03 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.07,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 2200, amount: 0.1 }),
    q: 2,
    attackMs: 0.6,
    decayMs: 24,
    peak: 0.18 * options.volume,
  });
}
