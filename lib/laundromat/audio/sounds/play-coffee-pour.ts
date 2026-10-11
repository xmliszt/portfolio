import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { startLfo } from "./start-lfo";
import type { VoiceOptions } from "./voice-options";

/** Play coffee poured into a mug: a bandpassed noise stream that rises in pitch as the mug fills, with a fast gurgle. */
export function playCoffeePour(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  const pourMs = jitter({ value: 900, amount: 0.1 });
  const gurgle = options.context.createGain();
  gurgle.gain.value = 0.75;
  gurgle.connect(options.destination);
  const lfo = startLfo({
    context: options.context,
    param: gurgle.gain,
    rateHz: jitter({ value: 14, amount: 0.2 }),
    depth: 0.25,
  });
  lfo.stop(startTimeS + pourMs / 1000 + 0.05);
  lfo.onended = () => gurgle.disconnect();
  playNoiseBurst({
    ...options,
    destination: gurgle,
    startTimeS,
    color: "pink",
    filterType: "bandpass",
    frequencyHz: jitter({ value: 450, amount: 0.1 }),
    endFrequencyHz: jitter({ value: 1700, amount: 0.1 }),
    q: 2.2,
    attackMs: 60,
    holdMs: pourMs * 0.7,
    decayMs: pourMs * 0.3,
    peak: 0.22 * options.volume,
  });
}
