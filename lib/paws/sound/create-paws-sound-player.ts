import type { Step } from "@/lib/paws/cat-look";
import type { Age, VoiceSettings } from "@/lib/paws/voice-settings";

import {
  type BabbleSyllable,
  getBabbleSyllables,
  RECORDED_LETTERS,
  type RecordedLetter,
} from "./get-babble-syllables";
import { getBabbleVoice } from "./get-babble-voice";
import { getCatPlaybackRate } from "./get-cat-playback-rate";
import { getPanFromWorldX } from "./get-pan-from-world-x";
import { getPawsSoundUrl } from "./get-paws-sound-url";
import { getRmsGain } from "./get-rms-gain";
import type { PawsSound } from "./paws-sound";
import { scheduleBabble } from "./schedule-babble";
import { scheduleUiNotes } from "./schedule-ui-notes";
import { UI_SOUNDS, type UiSound } from "./ui-sounds";

const MASTER_LEVEL = 0.7;
const MUTE_TIME_CONSTANT_S = 0.03;
const CAT_COOLDOWN_MS = 900;
const MAX_CLIP_S = 2;
const FADE_OUT_S = 0.12;
/** Each sound's level in decibels after its loudness is matched to the others, set by ear. */
const SOUND_LEVEL_DB = {
  meow: -6,
  trill: -6,
  purr: -6,
  lick: -6,
} as const satisfies { [sound in PawsSound]: number };
const MUSIC_URL = "/paws/sounds/music.mp3";
/** Where the music's seamless loop sits in `MUSIC_URL`, in seconds; the file holds one extra second of the loop on each side. */
const MUSIC_LOOP = { start: 1, length: 60.923084 } as const;
const MUSIC_LEVEL_DB = -12;
const UI_LEVEL_DB = -6;
const OLD_VIBRATO_CENTS = 35;
const OLD_VIBRATO_HZ = 5.5;
const BABBLE_LEVEL = 0.6;
const getLetterUrl = (letter: RecordedLetter) => `/paws/letters/${letter}.mp3`;
const BABBLE_CUT_S = 0.03;

export type PawsSoundCue = {
  userId: string;
  sound: PawsSound;
  voice: VoiceSettings;
  x: number;
  size: Step;
};

type Clip = { buffer: AudioBuffer; gain: number };

type Graph = {
  context: AudioContext;
  master: GainNode;
  compressor: DynamicsCompressorNode;
};

async function fetchClipBytes(url: string) {
  try {
    const response = await fetch(url);
    return response.ok ? await response.arrayBuffer() : undefined;
  } catch {
    return undefined;
  }
}

/** Return a player for the cats' meows, trills and purrs that creates its `AudioContext` on the first `unlock`, which the page calls from a user gesture. */
export function createPawsSoundPlayer(options: {
  createContext: () => AudioContext;
  fetchClip?: (url: string) => Promise<ArrayBuffer | undefined>;
  nowMs?: () => number;
}) {
  const fetchClip = options.fetchClip ?? fetchClipBytes;
  const nowMs = options.nowMs ?? (() => performance.now());
  const state: {
    graph?: Graph;
    muted: boolean;
    mutedCats: { [userId: string]: true | undefined };
    lastPlayedAtMs: { [userId: string]: number | undefined };
    clips: { [url: string]: Promise<Clip | undefined> | undefined };
    babbles: { [userId: string]: GainNode | undefined };
    music?: AudioBufferSourceNode;
  } = {
    muted: false,
    mutedCats: {},
    lastPlayedAtMs: {},
    clips: {},
    babbles: {},
  };

  function createGraph() {
    const context = options.createContext();
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    const master = context.createGain();
    master.gain.value = state.muted ? 0 : MASTER_LEVEL;
    compressor.connect(master);
    master.connect(context.destination);
    return { context, master, compressor };
  }

  function loadClip(graph: Graph, url: string) {
    const cached = state.clips[url];
    if (cached !== undefined) return cached;
    const loading = fetchClip(url)
      .then((bytes) =>
        bytes === undefined ? undefined : graph.context.decodeAudioData(bytes)
      )
      .then((buffer) => {
        if (buffer === undefined) return undefined;
        const channels = Array.from(
          { length: buffer.numberOfChannels },
          (_, index) => buffer.getChannelData(index)
        );
        return { buffer, gain: getRmsGain(channels) };
      })
      .catch(() => undefined)
      .then((clip) => {
        if (clip === undefined && state.clips[url] === loading)
          state.clips[url] = undefined;
        return clip;
      });
    state.clips[url] = loading;
    return loading;
  }

  function startClip(graph: Graph, clip: Clip, cue: PawsSoundCue) {
    const { context } = graph;
    const source = context.createBufferSource();
    source.buffer = clip.buffer;
    source.playbackRate.value = getCatPlaybackRate({
      sound: cue.sound,
      size: cue.size,
      age: cue.voice.age,
      userId: cue.userId,
    });
    const gain = context.createGain();
    const startAt = context.currentTime;
    const playedS = Math.min(
      clip.buffer.duration / source.playbackRate.value,
      MAX_CLIP_S
    );
    const level = clip.gain * 10 ** (SOUND_LEVEL_DB[cue.sound] / 20);
    gain.gain.setValueAtTime(level, startAt);
    gain.gain.setValueAtTime(
      level,
      Math.max(startAt, startAt + playedS - FADE_OUT_S)
    );
    const vibrato =
      cue.voice.age === "old" && cue.sound !== "meow"
        ? context.createOscillator()
        : undefined;
    const vibratoDepth =
      vibrato === undefined ? undefined : context.createGain();
    if (vibrato !== undefined && vibratoDepth !== undefined) {
      vibrato.frequency.value = OLD_VIBRATO_HZ;
      vibratoDepth.gain.value = OLD_VIBRATO_CENTS;
      vibrato.connect(vibratoDepth);
      vibratoDepth.connect(source.detune);
      vibrato.start(startAt);
      vibrato.stop(startAt + playedS);
    }
    gain.gain.linearRampToValueAtTime(0, startAt + playedS);
    const panner = context.createStereoPanner();
    panner.pan.value = getPanFromWorldX(cue.x);
    source.connect(gain);
    gain.connect(panner);
    panner.connect(graph.compressor);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      panner.disconnect();
      vibrato?.disconnect();
      vibratoDepth?.disconnect();
    };
    source.start(startAt);
    source.stop(startAt + playedS);
  }

  /** Create and resume the audio context, start the looping music and start loading the recorded letters; call it from a pointer or key event so the browser allows sound. */
  async function unlock() {
    if (state.graph === undefined) {
      const graph = createGraph();
      state.graph = graph;
      RECORDED_LETTERS.forEach(
        (letter) => void loadClip(graph, getLetterUrl(letter))
      );
      startMusic(graph);
    }
    if (state.graph.context.state === "suspended")
      await state.graph.context.resume();
  }

  /** Fetch and decode `url` ahead of its first play. */
  async function preload(url: string) {
    if (state.graph === undefined) return;
    await loadClip(state.graph, url);
  }

  /** Play one cat's sound unless sound is muted, the cat is muted, it played within the cooldown, or the player is not unlocked. */
  function play(cue: PawsSoundCue) {
    const graph = state.graph;
    if (graph === undefined || state.muted || state.mutedCats[cue.userId])
      return;
    const now = nowMs();
    const lastPlayedAtMs = state.lastPlayedAtMs[cue.userId];
    if (lastPlayedAtMs !== undefined && now - lastPlayedAtMs < CAT_COOLDOWN_MS)
      return;
    state.lastPlayedAtMs[cue.userId] = now;
    void loadClip(graph, getPawsSoundUrl(cue)).then((clip) => {
      if (
        clip === undefined ||
        state.graph !== graph ||
        state.muted ||
        state.mutedCats[cue.userId]
      )
        return;
      startClip(graph, clip, cue);
    });
  }

  /** Babble `text` in the cat's voice, panned to world `x`, cutting off that cat's previous line, unless `text` has nothing to say, sound or the cat is muted, or the player is not unlocked. */
  function speak(line: {
    userId: string;
    text: string;
    x: number;
    voice: VoiceSettings;
    size: Step;
  }) {
    const graph = state.graph;
    if (graph === undefined || state.muted || state.mutedCats[line.userId])
      return;
    const syllables = getBabbleSyllables(line.text);
    const needed = [
      ...new Set(
        syllables.flatMap((syllable) =>
          syllable.kind === "voiced" ? [syllable.letter] : []
        )
      ),
    ];
    if (needed.length === 0) return;
    void Promise.all(
      needed.map((letter) => loadClip(graph, getLetterUrl(letter)))
    ).then((clips) => {
      if (state.graph !== graph || state.muted || state.mutedCats[line.userId])
        return;
      startBabble({
        graph,
        line,
        syllables,
        letters: needed.reduce<{ [letter in RecordedLetter]?: AudioBuffer }>(
          (letters, letter, index) => ({
            ...letters,
            [letter]: clips[index]?.buffer,
          }),
          {}
        ),
      });
    });
  }

  /** Fade out the cat's line in progress, if it has one. */
  function hush(userId: string) {
    const level = state.babbles[userId];
    const graph = state.graph;
    if (level === undefined || graph === undefined) return;
    level.gain.setTargetAtTime(0, graph.context.currentTime, BABBLE_CUT_S);
    state.babbles[userId] = undefined;
  }

  function startBabble(options: {
    graph: Graph;
    line: { userId: string; x: number; voice: VoiceSettings; size: Step };
    syllables: BabbleSyllable[];
    letters: { [letter in RecordedLetter]?: AudioBuffer };
  }) {
    const { graph, line } = options;
    const { context } = graph;
    const previous = state.babbles[line.userId];
    if (previous !== undefined) {
      previous.gain.setTargetAtTime(0, context.currentTime, BABBLE_CUT_S);
      window.setTimeout(() => previous.disconnect(), BABBLE_CUT_S * 5000);
    }
    const level = context.createGain();
    level.gain.value = BABBLE_LEVEL;
    state.babbles[line.userId] = level;
    const panner = context.createStereoPanner();
    panner.pan.value = getPanFromWorldX(line.x);
    level.connect(panner);
    panner.connect(graph.compressor);
    const endsAt = scheduleBabble({
      context,
      destination: level,
      syllables: options.syllables,
      letters: options.letters,
      voice: getBabbleVoice({
        voice: line.voice,
        size: line.size,
        userId: line.userId,
      }),
      startAt: context.currentTime + 0.02,
      random: Math.random,
    });
    const ender = context.createConstantSource();
    ender.offset.value = 0;
    ender.connect(level);
    ender.onended = () => {
      ender.disconnect();
      panner.disconnect();
      level.disconnect();
      if (state.babbles[line.userId] === level)
        state.babbles[line.userId] = undefined;
    };
    ender.start();
    ender.stop(endsAt + 0.1);
  }

  function startMusic(graph: Graph) {
    void fetchClip(MUSIC_URL)
      .then((bytes) =>
        bytes === undefined ? undefined : graph.context.decodeAudioData(bytes)
      )
      .then((buffer) => {
        if (buffer === undefined || state.graph !== graph || state.music)
          return;
        const source = graph.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = MUSIC_LOOP.start;
        source.loopEnd = MUSIC_LOOP.start + MUSIC_LOOP.length;
        const level = graph.context.createGain();
        level.gain.value = 10 ** (MUSIC_LEVEL_DB / 20);
        source.connect(level);
        level.connect(graph.master);
        source.start(graph.context.currentTime + 0.05, MUSIC_LOOP.start);
        state.music = source;
      })
      .catch(() => undefined);
  }

  /** Play the interface sound `sound`, opening the audio context first if this call comes from a pointer or key event, unless sound is muted. */
  function playUi(sound: UiSound) {
    void unlock().then(() => {
      const graph = state.graph;
      if (graph === undefined || state.muted) return;
      const level = graph.context.createGain();
      level.gain.value = 10 ** (UI_LEVEL_DB / 20);
      level.connect(graph.master);
      scheduleUiNotes({
        context: graph.context,
        destination: level,
        notes: UI_SOUNDS[sound],
        startAt: graph.context.currentTime + 0.01,
      });
      window.setTimeout(() => level.disconnect(), 2000);
    });
  }

  /** Mute or unmute every cat. */
  function setMuted(muted: boolean) {
    state.muted = muted;
    const graph = state.graph;
    if (graph === undefined) return;
    graph.master.gain.setTargetAtTime(
      muted ? 0 : MASTER_LEVEL,
      graph.context.currentTime,
      MUTE_TIME_CONSTANT_S
    );
  }

  /** Mute or unmute one cat's sounds. */
  function setCatMuted(cat: { userId: string; muted: boolean }) {
    state.mutedCats[cat.userId] = cat.muted ? true : undefined;
  }

  /** Close the audio context and drop every cached clip; a later `unlock` opens a new context. */
  function dispose() {
    state.music = undefined;
    state.clips = {};
    state.babbles = {};
    void state.graph?.context.close();
    state.graph = undefined;
  }

  return {
    unlock,
    preload,
    play,
    speak,
    hush,
    playUi,
    setMuted,
    setCatMuted,
    dispose,
  };
}
