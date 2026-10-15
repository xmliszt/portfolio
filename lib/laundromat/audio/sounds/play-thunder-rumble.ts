import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

/** Play one roll of distant thunder heard through a closed window: a low swelling rumble with a deep tone under it and a muffled crack at its start. */
export function playThunderRumble(
  options: VoiceOptions & { startTimeS?: number }
) {
  const startTimeS = options.startTimeS ?? options.context.currentTime + 0.01;
  const destination = options.destination;
  const context = options.context;
  playNoiseBurst({
    context,
    destination,
    startTimeS,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: jitter({ value: 900, amount: 0.25 }),
    endFrequencyHz: 300,
    q: 0.6,
    attackMs: 30,
    decayMs: jitter({ value: 450, amount: 0.3 }),
    peak: jitter({ value: 0.12, amount: 0.4 }) * options.volume,
  });
  playNoiseBurst({
    context,
    destination,
    startTimeS: startTimeS + 0.08,
    color: "brown",
    filterType: "lowpass",
    frequencyHz: jitter({ value: 220, amount: 0.2 }),
    endFrequencyHz: 70,
    q: 0.7,
    attackMs: jitter({ value: 500, amount: 0.3 }),
    holdMs: jitter({ value: 700, amount: 0.4 }),
    decayMs: jitter({ value: 3200, amount: 0.3 }),
    peak: jitter({ value: 0.3, amount: 0.3 }) * options.volume,
  });
  playTone({
    context,
    destination,
    startTimeS: startTimeS + 0.1,
    type: "sine",
    frequencyHz: jitter({ value: 48, amount: 0.1 }),
    endFrequencyHz: 34,
    attackMs: 400,
    holdMs: 500,
    decayMs: 2600,
    peak: jitter({ value: 0.08, amount: 0.3 }) * options.volume,
  });
}
