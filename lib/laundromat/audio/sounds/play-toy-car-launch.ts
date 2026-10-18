import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const RUN_MS = 1950;

/** Play a toy car's electric motor spinning up from a standstill to the top of the ramp: a rising whine over a light wheel hum. */
export function playToyCarLaunch(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  playTone({
    ...options,
    startTimeS,
    type: "sawtooth",
    frequencyHz: 140,
    endFrequencyHz: 820,
    glideMs: RUN_MS,
    attackMs: 120,
    holdMs: RUN_MS - 320,
    decayMs: 200,
    peak: 0.035 * options.volume,
  });
  playTone({
    ...options,
    startTimeS,
    type: "triangle",
    frequencyHz: 280,
    endFrequencyHz: 1640,
    glideMs: RUN_MS,
    attackMs: 150,
    holdMs: RUN_MS - 350,
    decayMs: 200,
    peak: 0.025 * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: 400,
    endFrequencyHz: 1400,
    q: 1.2,
    attackMs: 200,
    holdMs: RUN_MS - 400,
    decayMs: 200,
    peak: 0.06 * options.volume,
  });
}
