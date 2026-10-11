import type { LoopName, SoundName } from "./sound-names";

export type SoundSample =
  | {
      kind: "generated";
      prompt: string;
      durationSeconds: number;
      promptInfluence: number;
      gain: number;
      lengthMs?: number;
    }
  | { kind: "recorded"; sourceUrl: string; gain: number }
  | { kind: "synthesized" };

export const SOUND_SAMPLE_BASE_PATH = "/sounds/laundromat";

export const SOUND_SAMPLES = {
  "door-latch-open": {
    kind: "generated",
    prompt:
      "Front-loading washing machine door latch releasing, a plastic click then the round glass door popping open, close-up, dry, no room echo",
    durationSeconds: 1,
    promptInfluence: 0.6,
    gain: 0.8,
  },
  "door-latch-close": {
    kind: "generated",
    prompt:
      "Front-loading washing machine round glass door pushed shut, firm plastic latch click, close-up, dry",
    durationSeconds: 1,
    promptInfluence: 0.6,
    gain: 0.8,
  },
  "start-button": {
    kind: "generated",
    prompt:
      "Pressing a chunky plastic start button on a laundromat washing machine, single mechanical click with a soft electronic beep",
    durationSeconds: 0.6,
    promptInfluence: 0.6,
    gain: 0.7,
  },
  "knob-click": {
    kind: "generated",
    prompt:
      "Single detent click of a plastic rotary dial on a washing machine turned one notch, very short, close-up",
    durationSeconds: 0.5,
    promptInfluence: 0.7,
    gain: 0.6,
  },
  "coffee-switch": {
    kind: "generated",
    prompt:
      "Flipping a small rocker power switch on a kitchen appliance, single plastic click, close-up",
    durationSeconds: 0.5,
    promptInfluence: 0.7,
    gain: 0.7,
  },
  "page-flip": {
    kind: "generated",
    prompt:
      "Turning one paper page of a small notebook, soft paper rustle, close-up, quiet room",
    durationSeconds: 0.8,
    promptInfluence: 0.6,
    gain: 0.8,
  },
  "notebook-open": {
    kind: "generated",
    prompt:
      "Opening a small hardcover notebook on a wooden table, cover flap and soft paper settle",
    durationSeconds: 1,
    promptInfluence: 0.6,
    gain: 0.8,
  },
  "collect-laundry": {
    kind: "generated",
    prompt:
      "Grabbing a soft armful of cotton clothes and dropping them into a woven laundry basket, fabric rustle and soft thud",
    durationSeconds: 1.2,
    promptInfluence: 0.5,
    gain: 0.8,
  },
  "done-ding": { kind: "synthesized" },
  "room-door-open": {
    kind: "generated",
    prompt:
      "Wooden bedroom door handle turned and the door swinging open with a gentle hinge creak, indoor apartment",
    durationSeconds: 2,
    promptInfluence: 0.5,
    gain: 0.8,
  },
  "door-locked": {
    kind: "generated",
    prompt:
      "Trying the handle of a locked wooden bedroom door, a short metallic rattle of the lever against the latch, door does not open, close-up, dry",
    durationSeconds: 0.8,
    promptInfluence: 0.7,
    gain: 0.8,
  },
  "tv-static": {
    kind: "generated",
    prompt:
      "Old CRT television changing channels, a short burst of white noise static and crackle, then silence",
    durationSeconds: 0.6,
    promptInfluence: 0.6,
    gain: 0.5,
  },
  "coffee-brew-done": {
    kind: "recorded",
    sourceUrl: "https://freesound.org/people/madracha/sounds/833816/",
    gain: 0.8,
  },
  "notebook-free": { kind: "synthesized" },
  "sliding-door": {
    kind: "generated",
    prompt:
      "Automatic glass sliding door of a small convenience store opening with a soft motor whoosh, and a gentle two-tone electronic entry chime",
    durationSeconds: 2.5,
    promptInfluence: 0.5,
    gain: 0.7,
    lengthMs: 1200,
  },
  "lamp-flicker": {
    kind: "recorded",
    sourceUrl: "https://freesound.org/people/mmaruska/sounds/232447/",
    gain: 0.6,
  },
  "lamp-off": { kind: "synthesized" },
  "coffee-beep": {
    kind: "generated",
    prompt:
      "Single short electronic beep of a kitchen coffee maker turning on, clean high tone, close-up",
    durationSeconds: 0.5,
    promptInfluence: 0.7,
    gain: 0.5,
  },
  "washer-running": {
    kind: "generated",
    prompt:
      "Front-loading washing machine running a wash cycle in a quiet laundromat, drum turning, water sloshing, low motor hum, steady",
    durationSeconds: 20,
    promptInfluence: 0.4,
    gain: 0.4,
  },
  "dryer-running": {
    kind: "generated",
    prompt:
      "Commercial tumble dryer running in a laundromat, steady low rumble and soft clothes tumbling, warm air fan, steady",
    durationSeconds: 20,
    promptInfluence: 0.4,
    gain: 0.4,
  },
  "coffee-brewing": {
    kind: "recorded",
    sourceUrl: "https://freesound.org/people/madracha/sounds/833816/",
    gain: 0.7,
  },
  "tv-no-signal": {
    kind: "generated",
    prompt:
      "Old CRT television with no signal, steady soft white noise static hiss",
    durationSeconds: 10,
    promptInfluence: 0.6,
    gain: 0.25,
  },
} satisfies { [name in SoundName | LoopName]: SoundSample };
