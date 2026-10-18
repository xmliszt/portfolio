import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play an instant camera pushing out its print: a small motor whirring up and down over the rasp of the print sliding out. */
export function playCameraEject(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playTone({
    ...options,
    startTimeS,
    type: "sawtooth",
    frequencyHz: jitter({ value: 150, amount: 0.05 }),
    endFrequencyHz: 210,
    glideMs: 180,
    attackMs: 40,
    holdMs: 520,
    decayMs: 120,
    peak: 0.016 * options.volume,
    modulatorRatio: 3.01,
    modulationIndex: 0.6,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + 0.06,
    color: "white",
    filterType: "bandpass",
    frequencyHz: 1900,
    endFrequencyHz: 2600,
    q: 1.1,
    attackMs: 60,
    holdMs: 420,
    decayMs: 160,
    peak: 0.045 * options.volume,
  });
}
