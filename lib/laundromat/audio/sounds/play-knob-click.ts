import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play one rotary-knob detent tick: a bandpassed noise transient over a faint high body ping. */
export function playKnobClick(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "white",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 4200, amount: 0.12 }),
    q: 2.2,
    attackMs: 0.4,
    decayMs: jitter({ value: 11, amount: 0.2 }),
    peak: jitter({ value: 0.22, amount: 0.15 }) * options.volume,
  });
  playTone({
    ...options,
    startTimeS,
    type: "sine",
    frequencyHz: jitter({ value: 2100, amount: 0.08 }),
    attackMs: 0.5,
    decayMs: 16,
    peak: 0.035 * options.volume,
  });
}
