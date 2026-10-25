import { TOY_DELIVERY_TIMING } from "@/lib/laundromat/toy/toy-delivery-timing";

import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

export function playToyBoxLaunch(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const durationMs = TOY_DELIVERY_TIMING.launchMs;
  playNoiseBurst({
    ...options,
    startTimeS,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: 2200,
    endFrequencyHz: 250,
    q: 0.7,
    attackMs: 120,
    holdMs: 380,
    decayMs: durationMs - 500,
    peak: 0.18 * options.volume,
  });
  playTone({
    ...options,
    startTimeS,
    type: "triangle",
    frequencyHz: 100,
    endFrequencyHz: 45,
    glideMs: durationMs,
    attackMs: 100,
    holdMs: 250,
    decayMs: durationMs - 350,
    peak: 0.06 * options.volume,
  });
}
