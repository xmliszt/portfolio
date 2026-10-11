import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { startLfo } from "./start-lfo";
import type { VoiceOptions } from "./voice-options";

/** Play a paper page turn: pink noise swept up through a wide bandpass with a fast flutter, ending in a soft settle. */
export function playPageFlip(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const sweepMs = jitter({ value: 300, amount: 0.15 });
  const flutter = options.context.createGain();
  flutter.gain.value = 0.7;
  flutter.connect(options.destination);
  const lfo = startLfo({
    context: options.context,
    param: flutter.gain,
    rateHz: jitter({ value: 22, amount: 0.25 }),
    depth: 0.3,
  });
  lfo.stop(startTimeS + sweepMs / 1000 + 0.05);
  lfo.onended = () => flutter.disconnect();
  playNoiseBurst({
    ...options,
    destination: flutter,
    startTimeS,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 800, amount: 0.15 }),
    endFrequencyHz: jitter({ value: 3400, amount: 0.15 }),
    q: 0.9,
    attackMs: sweepMs * 0.3,
    decayMs: sweepMs * 0.7,
    peak: jitter({ value: 0.2, amount: 0.15 }) * options.volume,
  });
  playNoiseBurst({
    ...options,
    startTimeS: startTimeS + (sweepMs * 0.85) / 1000,
    color: "pink",
    filterType: "lowpass",
    frequencyHz: 1200,
    q: 0.7,
    attackMs: 3,
    decayMs: 45,
    peak: 0.08 * options.volume,
  });
}
