import type { BabbleSyllable, BabbleVowel } from "./get-babble-syllables";
import type { BabbleVoice } from "./get-babble-voice";

/** First and second formants of each vowel, in hertz, for a small voice. */
const FORMANTS = {
  a: [850, 1600],
  e: [600, 2300],
  i: [350, 2800],
  o: [500, 1000],
  u: [380, 900],
} as const satisfies { [vowel in BabbleVowel]: readonly [number, number] };

const ATTACK_SECONDS = 0.008;
const GAP_SHARE = 0.25;
const SHORT_PAUSE_SHARE = 1.2;
const LONG_PAUSE_SHARE = 2.5;
const ONSET_SECONDS = 0.018;
const PEAK = 0.5;
const LOUD_PEAK = 0.75;

function createNoise(context: BaseAudioContext) {
  const length = Math.round(context.sampleRate * 0.5);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Schedule `syllables` spoken in `voice` into `destination` from `startAt` seconds on `context`, using `random` for each syllable's pitch wobble, and return the time the last one ends. */
export function scheduleBabble(options: {
  context: BaseAudioContext;
  destination: AudioNode;
  syllables: BabbleSyllable[];
  voice: BabbleVoice;
  startAt: number;
  random: () => number;
}) {
  const { context, destination, voice } = options;
  const noise = createNoise(context);
  const voicedCount = options.syllables.filter(
    (syllable) => syllable.kind === "voiced"
  ).length;
  const step = voice.syllableSeconds;
  return options.syllables.reduce(
    (state, syllable) => {
      if (syllable.kind === "pause")
        return {
          at:
            state.at +
            step * (syllable.long ? LONG_PAUSE_SHARE : SHORT_PAUSE_SHARE),
          spoken: state.spoken,
        };
      const at = state.at;
      const length = step * (1 - GAP_SHARE);
      const progress = voicedCount <= 1 ? 0 : state.spoken / (voicedCount - 1);
      const semitones =
        syllable.semitones +
        voice.slideSemitones * progress +
        (options.random() * 2 - 1) * voice.wobbleSemitones;
      const pitch = voice.pitchHz * 2 ** (semitones / 12);

      const source = context.createOscillator();
      source.type = "sawtooth";
      source.frequency.setValueAtTime(pitch * 1.04, at);
      source.frequency.exponentialRampToValueAtTime(pitch, at + length * 0.6);
      const envelope = context.createGain();
      const peak = syllable.loud ? LOUD_PEAK : PEAK;
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(peak, at + ATTACK_SECONDS);
      envelope.gain.exponentialRampToValueAtTime(0.001, at + length);
      const [first, second] = FORMANTS[syllable.vowel];
      const formants = [first, second].map((frequency, index) => {
        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = frequency * voice.formantScale;
        filter.Q.value = index === 0 ? 4 : 6;
        return filter;
      });
      source.connect(envelope);
      for (const filter of formants) {
        envelope.connect(filter);
        filter.connect(destination);
      }

      const breath = voice.rasp > 0 || syllable.onset !== "none";
      const noiseSource = breath ? context.createBufferSource() : undefined;
      if (noiseSource !== undefined) {
        noiseSource.buffer = noise;
        const shape = context.createBiquadFilter();
        const noiseGain = context.createGain();
        switch (syllable.onset) {
          case "hiss":
            shape.type = "highpass";
            shape.frequency.value = 4000;
            break;
          case "stop":
            shape.type = "bandpass";
            shape.frequency.value = 2500;
            break;
          case "hum":
            shape.type = "lowpass";
            shape.frequency.value = 600;
            break;
          case "none":
            shape.type = "bandpass";
            shape.frequency.value = first * voice.formantScale * 2;
            break;
          default: {
            const unknown: never = syllable.onset;
            throw new Error(`Unknown onset ${String(unknown)}`);
          }
        }
        const onsetPeak = syllable.onset === "none" ? 0 : peak * 0.6;
        noiseGain.gain.setValueAtTime(onsetPeak, at);
        noiseGain.gain.linearRampToValueAtTime(
          peak * voice.rasp * 0.5,
          at + ONSET_SECONDS
        );
        noiseGain.gain.exponentialRampToValueAtTime(0.001, at + length);
        noiseSource.connect(shape);
        shape.connect(noiseGain);
        noiseGain.connect(destination);
        noiseSource.start(at, options.random() * 0.4);
        noiseSource.stop(at + length);
        noiseSource.onended = () => {
          noiseSource.disconnect();
          shape.disconnect();
          noiseGain.disconnect();
        };
      }
      source.start(at);
      source.stop(at + length);
      source.onended = () => {
        source.disconnect();
        envelope.disconnect();
        formants.forEach((filter) => filter.disconnect());
      };
      return { at: at + step, spoken: state.spoken + 1 };
    },
    { at: options.startAt, spoken: 0 }
  ).at;
}
