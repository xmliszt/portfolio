export type UiSound =
  | "codeSent"
  | "signedIn"
  | "optionPick"
  | "shuffle"
  | "stepNext"
  | "bringIn"
  | "catJoins"
  | "chatOpen"
  | "chatSend"
  | "refused"
  | "soundOn"
  | "language";

export type UiNote = {
  freq: number;
  at: number;
  decay: number;
  gain: number;
  type: OscillatorType;
  attack?: number;
  sweepTo?: number;
  harmonic?: number;
};

const C5 = 523.25;
const E5 = 659.25;
const C6 = 1046.5;
const E6 = 1318.5;
const E4 = 329.63;

const mallet = (
  freq: number,
  at: number,
  decay = 0.35,
  gain = 0.28
): UiNote => ({
  freq,
  at,
  decay,
  gain,
  type: "sine",
  harmonic: 4,
});
const bubble = (
  freq: number,
  at: number,
  to: number,
  decay = 0.12
): UiNote => ({
  freq,
  at,
  decay,
  sweepTo: to,
  gain: 0.3,
  type: "sine",
});
const tick = (freq: number, at: number, gain = 0.18): UiNote => ({
  freq,
  at,
  decay: 0.04,
  attack: 0.001,
  gain,
  type: "triangle",
});

/** The short notes each interface moment plays, picked by ear on the sound review page. */
export const UI_SOUNDS = {
  codeSent: [bubble(420, 0, 700), bubble(560, 0.09, 940)],
  signedIn: [bubble(400, 0, 800), mallet(C6, 0.1, 0.5, 0.2)],
  optionPick: [tick(1800, 0)],
  shuffle: [0, 0.05, 0.1, 0.15].map((at, index) =>
    bubble(400 + index * 120, at, 700 + index * 160, 0.07)
  ),
  stepNext: [bubble(350, 0, 620, 0.1)],
  bringIn: [bubble(300, 0, 1200, 0.25), mallet(E6, 0.22, 0.7, 0.2)],
  catJoins: [mallet(E5, 0, 0.5, 0.18), mallet(C5, 0.16, 0.7, 0.18)],
  chatOpen: [bubble(450, 0, 900, 0.09)],
  chatSend: [bubble(300, 0, 1400, 0.16)],
  refused: [mallet(E4, 0, 0.2, 0.25), mallet(330 * 0.75, 0.1, 0.3, 0.22)],
  soundOn: [tick(900, 0, 0.22), tick(1300, 0.03, 0.12)],
  language: [tick(1600, 0, 0.16), tick(1100, 0.04, 0.1)],
} as const satisfies { [sound in UiSound]: UiNote[] };
