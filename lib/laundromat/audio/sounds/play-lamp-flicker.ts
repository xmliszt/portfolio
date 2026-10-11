import { LAMP_FLICKER_STEPS } from "@/lib/laundromat/lamp-flicker-steps";

import { jitter } from "./jitter";
import { playNoiseBurst } from "./play-noise-burst";
import { startLoopedNoise } from "./start-looped-noise";
import type { VoiceOptions } from "./voice-options";

const MAINS_HZ = 100;
const HUM_PEAK = 0.05;
const HUM_HOLD_MS = 700;
const HUM_FADE_MS = 1600;
const TICK_RISE = 0.4;

/** Play a fluorescent tube starting in step with `LAMP_FLICKER_STEPS`: an electric buzz that cuts in and out with the light, a starter tick on each flash, then the steady hum fading under the room. */
export function playLampFlicker(options: VoiceOptions) {
  const { context } = options;
  const startTimeS = context.currentTime + 0.005;
  const output = context.createGain();
  output.gain.setValueAtTime(0, startTimeS);
  LAMP_FLICKER_STEPS.forEach(({ atMs, level }) =>
    output.gain.setValueAtTime(
      level * HUM_PEAK * options.volume,
      startTimeS + atMs / 1000
    )
  );
  const lastStepMs = LAMP_FLICKER_STEPS.at(-1)?.atMs ?? 0;
  const fadeStartS = startTimeS + (lastStepMs + HUM_HOLD_MS) / 1000;
  const endS = fadeStartS + HUM_FADE_MS / 1000;
  output.gain.setValueAtTime(HUM_PEAK * options.volume, fadeStartS);
  output.gain.exponentialRampToValueAtTime(0.0001, endS);
  output.connect(options.destination);

  const mains = context.createOscillator();
  mains.type = "sawtooth";
  mains.frequency.value = MAINS_HZ;
  const mainsLowpass = context.createBiquadFilter();
  mainsLowpass.type = "lowpass";
  mainsLowpass.frequency.value = 1400;
  mains.connect(mainsLowpass).connect(output);

  const buzz = startLoopedNoise({ context, color: "white" });
  const buzzBand = context.createBiquadFilter();
  buzzBand.type = "bandpass";
  buzzBand.frequency.value = 3000;
  buzzBand.Q.value = 0.8;
  const buzzGain = context.createGain();
  buzzGain.gain.value = 0.5;
  buzz.connect(buzzBand).connect(buzzGain).connect(output);

  mains.start(startTimeS);
  mains.stop(endS + 0.05);
  buzz.stop(endS + 0.05);
  mains.onended = () => output.disconnect();

  LAMP_FLICKER_STEPS.forEach(({ atMs, level }, index) => {
    const previous = LAMP_FLICKER_STEPS[index - 1]?.level ?? 0;
    if (level - previous < TICK_RISE) return;
    playNoiseBurst({
      ...options,
      startTimeS: startTimeS + atMs / 1000,
      color: "white",
      filterType: "bandpass",
      frequencyHz: jitter({ value: 3200, amount: 0.15 }),
      q: 4,
      attackMs: 0.5,
      decayMs: 15,
      peak: 0.14 * options.volume,
    });
  });
}
