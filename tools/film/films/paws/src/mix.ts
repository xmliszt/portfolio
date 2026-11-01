import { getBabbleSyllables, RECORDED_LETTERS, type RecordedLetter } from "@/lib/paws/sound/get-babble-syllables";
import { getBabbleVoice } from "@/lib/paws/sound/get-babble-voice";
import { getCatPlaybackRate } from "@/lib/paws/sound/get-cat-playback-rate";
import { getMeowUrl } from "@/lib/paws/sound/get-meow-url";
import { getRmsGain } from "@/lib/paws/sound/get-rms-gain";
import { scheduleBabble } from "@/lib/paws/sound/schedule-babble";
import { scheduleUiNotes } from "@/lib/paws/sound/schedule-ui-notes";
import { UI_SOUNDS, type UiSound } from "@/lib/paws/sound/ui-sounds";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { db, renderMix, SAMPLE_RATE } from "../../../engine/src/render-mix";
import { FEATURE_VOICES } from "./features-takes";
import { LOOKS, NEW_LOOK } from "./takes";

type Cue = { t: number; sfx: string; gain?: number; pan?: number; text?: string };

const MUSIC_DB = -7;
const UI_DB = -9;
const CAT_DB = -5;

/** The voice and size each film cat speaks with. */
const CATS: { [userId: string]: { voice: VoiceSettings; size: "small" | "medium" | "large" } } = {
  "film-hero": { voice: { age: "adult", voice: "soft", mood: "chatty" }, size: LOOKS.hero.size },
  "film-ink": { voice: { age: "adult", voice: "deep", mood: "grumpy" }, size: LOOKS.ink.size },
  "film-cream": { voice: { age: "old", voice: "raspy", mood: "sleepy" }, size: LOOKS.cream.size },
  "film-calico": { voice: { age: "adult", voice: "squeaky", mood: "chatty" }, size: LOOKS.calico.size },
  "film-new": { voice: { age: "kitten", voice: "squeaky", mood: "chatty" }, size: NEW_LOOK.size },
  ...FEATURE_VOICES,
};
/** Where the music's seamless loop sits in the file, as the app plays it. */
const MUSIC_LOOP = { start: 1, length: 60.923084 };

function channels(buffer: AudioBuffer) {
  return Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
}

/** Render the film's sound from `cues` over the music, `seconds` long, and return it as 16-bit stereo WAV bytes in base64. */
function mix(options: { cues: Cue[]; seconds: number; fadeOutAt: number }) {
  return renderMix({
    seconds: options.seconds,
    fadeOutAt: options.fadeOutAt,
    music: { url: "/film/assets/music.mp3", gainDb: MUSIC_DB, loop: MUSIC_LOOP },
    schedule: async ({ context, master, load: get }) => {
      const letters: { [letter in RecordedLetter]?: AudioBuffer } = {};
      await Promise.all(RECORDED_LETTERS.map(async (letter) => { letters[letter] = await get(`/paws/letters/${letter}.mp3`); }));

      const random = createSeededRandom({ seed: 7 });
      for (const cue of options.cues) {
        const at = Math.max(0, cue.t - 0.03);
        const pan = context.createStereoPanner();
        pan.pan.value = cue.pan ?? 0;
        pan.connect(master);
        const [kind, a, b] = cue.sfx.split(":");
        if (kind === "ui") {
          const gain = context.createGain();
          gain.gain.value = db(UI_DB) * (cue.gain ?? 1);
          gain.connect(pan);
          scheduleUiNotes({ context, destination: gain, notes: UI_SOUNDS[a as UiSound], startAt: at });
        } else if (kind === "meow" || kind === "cat") {
          const userId = kind === "cat" ? a! : "film-new";
          const sound = kind === "cat" ? (b as "meow" | "purr") : "meow";
          const cat = CATS[userId] ?? CATS["film-hero"]!;
          const url = kind === "meow" ? `/paws/sounds/meow-${a}.mp3` : sound === "purr" ? "/paws/sounds/purr-1.mp3" : getMeowUrl(cat.voice);
          const buffer = await get(url);
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = getCatPlaybackRate({ sound, size: cat.size, age: cat.voice.age, userId });
          const gain = context.createGain();
          const level = getRmsGain(channels(buffer)) * db(CAT_DB) * (cue.gain ?? 1);
          const length = Math.min(2, buffer.duration / source.playbackRate.value);
          gain.gain.setValueAtTime(level, at);
          gain.gain.setValueAtTime(level, at + length - 0.12);
          gain.gain.linearRampToValueAtTime(0, at + length);
          source.connect(gain).connect(pan);
          source.start(at);
          source.stop(at + length + 0.05);
        } else if (kind === "say") {
          const cat = CATS[a!] ?? CATS["film-hero"]!;
          const gain = context.createGain();
          gain.gain.value = 0.6 * (cue.gain ?? 1);
          gain.connect(pan);
          scheduleBabble({ context, destination: gain, syllables: getBabbleSyllables(cue.text ?? ""), letters, voice: getBabbleVoice({ voice: cat.voice, size: cat.size, userId: a! }), startAt: at, random });
        } else if (kind === "pat") {
          const length = 0.09;
          const buffer = context.createBuffer(1, Math.ceil(length * SAMPLE_RATE), SAMPLE_RATE);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) {
            const t = i / SAMPLE_RATE;
            data[i] = (Math.sin(2 * Math.PI * (70 + 60 * Math.exp(-t * 60)) * t) * 0.9 + (random() * 2 - 1) * 0.25 * Math.exp(-t * 90)) * Math.exp(-t * 38);
          }
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = 0.9 + random() * 0.25;
          const filter = context.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 900;
          const gain = context.createGain();
          gain.gain.value = 0.9 * (cue.gain ?? 1);
          source.connect(filter).connect(gain).connect(pan);
          source.start(at);
        } else {
          throw new Error(`unknown sfx ${cue.sfx}`);
        }
      }
    },
  });
}

Object.assign(window, { mix });
