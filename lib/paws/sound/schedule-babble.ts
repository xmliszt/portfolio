import type { BabbleSyllable, RecordedLetter } from "./get-babble-syllables";
import { getBabbleTimes } from "./get-babble-times";
import type { BabbleVoice } from "./get-babble-voice";

const LETTER_LENGTH_SHARE = 1.3;
const FADE_SHARE = 0.3;
const LEVEL = 0.9;
const LOUD_LEVEL = 1.25;

/** Schedule `syllables` as recorded `letters` played in `voice` into `destination` from `startAt` seconds on `context`, each letter cut to a little over one step and pitched by `random` within the voice's wobble, and return the time the last one ends. */
export function scheduleBabble(options: {
  context: BaseAudioContext;
  destination: AudioNode;
  syllables: BabbleSyllable[];
  letters: { [letter in RecordedLetter]?: AudioBuffer };
  voice: BabbleVoice;
  startAt: number;
  random: () => number;
}) {
  const { context, destination, voice } = options;
  const step = voice.syllableSeconds;
  const length = step * LETTER_LENGTH_SHARE;
  const times = getBabbleTimes({
    syllables: options.syllables,
    syllableSeconds: step,
  });
  const voiced = options.syllables.flatMap((syllable, index) =>
    syllable.kind === "voiced"
      ? [{ syllable, at: options.startAt + times.startsAt[index] }]
      : []
  );
  voiced.forEach(({ syllable, at }, spoken) => {
    const buffer = options.letters[syllable.letter];
    if (buffer === undefined) return;
    const progress = voiced.length <= 1 ? 0 : spoken / (voiced.length - 1);
    const semitones =
      syllable.semitones +
      voice.slideSemitones * progress +
      (options.random() * 2 - 1) * voice.wobbleSemitones;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = voice.rate;
    source.detune.value = semitones * 100;
    const gain = context.createGain();
    const level = syllable.loud ? LOUD_LEVEL : LEVEL;
    gain.gain.setValueAtTime(level, at);
    gain.gain.setValueAtTime(level, at + length * (1 - FADE_SHARE));
    gain.gain.linearRampToValueAtTime(0, at + length);
    source.connect(gain);
    gain.connect(destination);
    source.start(at);
    source.stop(at + length);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
  });
  return options.startAt + times.endsAt + step * (LETTER_LENGTH_SHARE - 1);
}
