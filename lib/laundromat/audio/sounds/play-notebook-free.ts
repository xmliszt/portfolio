import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { playTone } from "./play-tone";
import type { VoiceOptions } from "./voice-options";

const STRIKE_TIMES_S = [0, 0.16];
const BELL_HZ = 1760;

function playStrike(options: VoiceOptions & { startTimeS: number }) {
  playNoiseBurst({
    ...options,
    color: "white",
    filterType: "bandpass",
    frequencyHz: 5200,
    q: 3,
    attackMs: 0.5,
    decayMs: 10,
    peak: 0.2 * options.volume,
  });
  const strikeHz = jitter({ value: BELL_HZ, amount: 0.003 });
  [
    { ratio: 1, decayMs: 1600, peak: 0.22 },
    { ratio: 2.76, decayMs: 700, peak: 0.07 },
    { ratio: 5.4, decayMs: 300, peak: 0.035 },
  ].forEach((partial) =>
    playTone({
      ...options,
      type: "sine",
      frequencyHz: strikeHz * partial.ratio,
      attackMs: 1.5,
      decayMs: partial.decayMs,
      peak: partial.peak * options.volume,
    })
  );
}

/** Play a front desk bell struck twice, ding-ding, bright and clear enough to notice from another tab. */
export function playNotebookFree(options: VoiceOptions) {
  const startTimeS = options.context.currentTime + 0.005;
  STRIKE_TIMES_S.forEach((offsetS) =>
    playStrike({ ...options, startTimeS: startTimeS + offsetS })
  );
}
