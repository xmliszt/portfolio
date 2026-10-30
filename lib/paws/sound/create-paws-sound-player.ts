import type { Step } from "@/lib/paws/cat-look";
import type { Age, VoiceSettings } from "@/lib/paws/voice-settings";

import { getBabbleSyllables } from "./get-babble-syllables";
import { getBabbleVoice } from "./get-babble-voice";
import { getCatPlaybackRate } from "./get-cat-playback-rate";
import { getPanFromWorldX } from "./get-pan-from-world-x";
import { getPawsSoundUrl } from "./get-paws-sound-url";
import { getRmsGain } from "./get-rms-gain";
import type { PawsSound } from "./paws-sound";
import { scheduleBabble } from "./schedule-babble";

const MASTER_LEVEL = 0.7;
const MUTE_TIME_CONSTANT_S = 0.03;
const CAT_COOLDOWN_MS = 900;
const MAX_CLIP_S = 2;
const FADE_OUT_S = 0.12;
const BABBLE_LEVEL = 0.6;

export type PawsSoundCue = {
  userId: string;
  sound: PawsSound;
  meowUrl: string;
  x: number;
  size: Step;
  age: Age;
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
  } = {
    muted: false,
    mutedCats: {},
    lastPlayedAtMs: {},
    clips: {},
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
    source.playbackRate.value = getCatPlaybackRate(cue);
    const gain = context.createGain();
    const startAt = context.currentTime;
    const playedS = Math.min(
      clip.buffer.duration / source.playbackRate.value,
      MAX_CLIP_S
    );
    gain.gain.setValueAtTime(clip.gain, startAt);
    gain.gain.setValueAtTime(
      clip.gain,
      Math.max(startAt, startAt + playedS - FADE_OUT_S)
    );
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
    };
    source.start(startAt);
    source.stop(startAt + playedS);
  }

  /** Create and resume the audio context; call it from a pointer or key event so the browser allows sound. */
  async function unlock() {
    state.graph ??= createGraph();
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

  /** Babble `text` in the cat's voice, panned to world `x`, unless sound is muted, the cat is muted, or the player is not unlocked. */
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
    const { context } = graph;
    const level = context.createGain();
    level.gain.value = BABBLE_LEVEL;
    const panner = context.createStereoPanner();
    panner.pan.value = getPanFromWorldX(line.x);
    level.connect(panner);
    panner.connect(graph.compressor);
    const endsAt = scheduleBabble({
      context,
      destination: level,
      syllables: getBabbleSyllables(line.text),
      voice: getBabbleVoice({
        voice: line.voice,
        size: line.size,
        userId: line.userId,
      }),
      startAt: context.currentTime + 0.02,
      random: Math.random,
    });
    const cleanup = context.createConstantSource();
    cleanup.onended = () => {
      cleanup.disconnect();
      level.disconnect();
      panner.disconnect();
    };
    cleanup.start();
    cleanup.stop(endsAt + 0.1);
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
    state.clips = {};
    void state.graph?.context.close();
    state.graph = undefined;
  }

  return { unlock, preload, play, speak, setMuted, setCatMuted, dispose };
}
