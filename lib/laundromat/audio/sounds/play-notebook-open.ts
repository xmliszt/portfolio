import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play a notebook cover opening: a slow, low cardboard whoosh that lands in a small soft thump. */
export function playNotebookOpen(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const landTimeS = startTimeS + jitter({ value: 0.3, amount: 0.1 });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 450, amount: 0.15 }),
    endFrequencyHz: jitter({ value: 1400, amount: 0.15 }),
    q: 0.7,
    attackMs: 160,
    decayMs: 170,
    peak: 0.16 * options.volume,
  });
  playTone({
    ...options,
    startTimeS: landTimeS,
    type: "sine",
    frequencyHz: jitter({ value: 115, amount: 0.06 }),
    endFrequencyHz: 70,
    glideMs: 70,
    attackMs: 2,
    decayMs: 90,
    peak: 0.17 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: landTimeS,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: 600,
    q: 0.7,
    attackMs: 2,
    decayMs: 60,
    peak: 0.12 * options.volume,
  });
}
