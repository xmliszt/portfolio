import type {
  BabbleOnset,
  BabbleSyllable,
  BabbleVowel,
} from "./get-babble-syllables";
import type { BabbleVoice } from "./get-babble-voice";

/** First and second formants of each vowel, in hertz, for a small voice. */
const FORMANTS = {
  a: [850, 1600],
  e: [600, 2300],
  i: [350, 2800],
  o: [500, 1000],
  u: [380, 900],
} as const satisfies { [vowel in BabbleVowel]: readonly [number, number] };

/** How each onset starts a syllable: its attack time in seconds and the pitch it slides down (or up) from, as a multiple. */
const ONSETS = {
  none: { attack: 0.008, fromPitch: 1.04 },
  stop: { attack: 0.003, fromPitch: 1.15 },
  hiss: { attack: 0.01, fromPitch: 1.08 },
  hum: { attack: 0.018, fromPitch: 0.94 },
} as const satisfies {
  [onset in BabbleOnset]: { attack: number; fromPitch: number };
};
const BREATH_SHARE = 0.25;
const GAP_SHARE = 0.25;
const SHORT_PAUSE_SHARE = 1.2;
const LONG_PAUSE_SHARE = 2.5;
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
      const onset = ONSETS[syllable.onset];
      source.frequency.setValueAtTime(pitch * onset.fromPitch, at);
      source.frequency.exponentialRampToValueAtTime(pitch, at + length * 0.6);
      const envelope = context.createGain();
      const peak = syllable.loud ? LOUD_PEAK : PEAK;
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(peak, at + onset.attack);
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

      const noiseSource =
        voice.rasp > 0 ? context.createBufferSource() : undefined;
      if (noiseSource !== undefined) {
        noiseSource.buffer = noise;
        const shape = context.createBiquadFilter();
        shape.type = "bandpass";
        shape.frequency.value = second * voice.formantScale;
        shape.Q.value = 2;
        const noiseGain = context.createGain();
        noiseGain.gain.setValueAtTime(0, at);
        noiseGain.gain.linearRampToValueAtTime(
          peak * voice.rasp * BREATH_SHARE,
          at + onset.attack
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
