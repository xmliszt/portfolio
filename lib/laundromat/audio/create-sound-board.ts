import { createRoomTail } from "./sounds/create-room-tail";
import { playCoffeeBeep } from "./sounds/play-coffee-beep";
import { playCoffeeBrewDone } from "./sounds/play-coffee-brew-done";
import { playCoffeePour } from "./sounds/play-coffee-pour";
import { playCoffeeSip } from "./sounds/play-coffee-sip";
import { playCoffeeSwitch } from "./sounds/play-coffee-switch";
import { playCollectLaundry } from "./sounds/play-collect-laundry";
import { playDoneDing } from "./sounds/play-done-ding";
import { playDoorLatchClose } from "./sounds/play-door-latch-close";
import { playDoorLatchOpen } from "./sounds/play-door-latch-open";
import { playDoorLocked } from "./sounds/play-door-locked";
import { playKnobClick } from "./sounds/play-knob-click";
import { playLampFlicker } from "./sounds/play-lamp-flicker";
import { playLampOff } from "./sounds/play-lamp-off";
import { playNotebookFree } from "./sounds/play-notebook-free";
import { playNotebookOpen } from "./sounds/play-notebook-open";
import { playPageFlip } from "./sounds/play-page-flip";
import { playRoomDoorOpen } from "./sounds/play-room-door-open";
import { playSample } from "./sounds/play-sample";
import { playSlidingDoor } from "./sounds/play-sliding-door";
import { playStartButton } from "./sounds/play-start-button";
import { playTouchGrass } from "./sounds/play-touch-grass";
import { playTvStatic } from "./sounds/play-tv-static";
import { startCoffeeBrewing } from "./sounds/start-coffee-brewing";
import { startDryerRunning } from "./sounds/start-dryer-running";
import { startSampleLoop } from "./sounds/start-sample-loop";
import { startTvNoSignal } from "./sounds/start-tv-no-signal";
import { startWasherRunning } from "./sounds/start-washer-running";
import type { LoopHandle, VoiceOptions } from "./sounds/voice-options";
import { getPeakGain } from "./get-peak-gain";
import type { LoopName, SoundName } from "./sound-names";
import { LOOP_NAMES, SOUND_NAMES } from "./sound-names";
import { SOUND_SAMPLE_BASE_PATH, SOUND_SAMPLES } from "./sound-samples";

const MASTER_LEVEL = 0.5;
const MASTER_LOWPASS_HZ = 9000;
const MUTE_TIME_CONSTANT_S = 0.03;
const LOOP_FADE_IN_MS = 700;
const LOOP_FADE_OUT_MS = 600;

const ONE_SHOTS = {
  "door-latch-open": playDoorLatchOpen,
  "door-latch-close": playDoorLatchClose,
  "start-button": playStartButton,
  "knob-click": playKnobClick,
  "coffee-switch": playCoffeeSwitch,
  "page-flip": playPageFlip,
  "notebook-open": playNotebookOpen,
  "collect-laundry": playCollectLaundry,
  "done-ding": playDoneDing,
  "room-door-open": playRoomDoorOpen,
  "door-locked": playDoorLocked,
  "tv-static": playTvStatic,
  "coffee-brew-done": playCoffeeBrewDone,
  "notebook-free": playNotebookFree,
  "sliding-door": playSlidingDoor,
  "lamp-flicker": playLampFlicker,
  "lamp-off": playLampOff,
  "coffee-beep": playCoffeeBeep,
  "coffee-pour": playCoffeePour,
  "coffee-sip": playCoffeeSip,
  "touch-grass": playTouchGrass,
} satisfies { [name in SoundName]: (options: VoiceOptions) => void };

const LOOPS = {
  "washer-running": startWasherRunning,
  "dryer-running": startDryerRunning,
  "coffee-brewing": startCoffeeBrewing,
  "tv-no-signal": startTvNoSignal,
} satisfies {
  [name in LoopName]: (
    options: VoiceOptions & { fadeInMs: number }
  ) => LoopHandle;
};

type Graph = { context: AudioContext; bus: GainNode; master: GainNode };

type SampleName = SoundName | LoopName;

async function fetchSampleIndex() {
  try {
    const response = await fetch(`${SOUND_SAMPLE_BASE_PATH}/index.json`);
    if (!response.ok) return [];
    const names: unknown = await response.json();
    return Array.isArray(names)
      ? [...SOUND_NAMES, ...LOOP_NAMES].filter((name) => names.includes(name))
      : [];
  } catch {
    return [];
  }
}

async function fetchSampleBytes(name: SampleName) {
  try {
    const response = await fetch(`${SOUND_SAMPLE_BASE_PATH}/${name}.mp3`);
    return response.ok ? await response.arrayBuffer() : undefined;
  } catch {
    return undefined;
  }
}

/** Return a sound board that plays the laundromat's one-shots and loops from recorded samples, synthesizing any sample that is missing, and creates its `AudioContext` and starts fetching samples on the first unmuted `resume`. */
export function createSoundBoard(
  options: {
    createContext?: () => AudioContext;
    fetchIndex?: () => Promise<SampleName[]>;
    fetchSample?: (name: SampleName) => Promise<ArrayBuffer | undefined>;
  } = {}
) {
  const createContext = options.createContext ?? (() => new AudioContext());
  const fetchIndex = options.fetchIndex ?? fetchSampleIndex;
  const fetchSample = options.fetchSample ?? fetchSampleBytes;
  const state: {
    graph?: Graph;
    muted: boolean;
    disposed: boolean;
    wantedLoops: { [name in LoopName]?: true };
    activeLoops: { [name in LoopName]?: LoopHandle };
    sampleLoops: { [name in LoopName]?: true };
    samplesRequested: boolean;
    undecoded: { [name in SampleName]?: ArrayBuffer };
    samples: {
      [name in SampleName]?: {
        buffer: AudioBuffer;
        gain: number;
        lengthMs: number | undefined;
      };
    };
  } = {
    muted: false,
    disposed: false,
    wantedLoops: {},
    activeLoops: {},
    sampleLoops: {},
    samplesRequested: false,
    undecoded: {},
    samples: {},
  };

  function requestSamples() {
    if (state.samplesRequested || state.muted || state.disposed) return;
    state.samplesRequested = true;
    void fetchIndex().then((names) =>
      names.forEach((name) => {
        if (state.disposed) return;
        void fetchSample(name).then((bytes) => {
          if (bytes === undefined || state.disposed) return;
          state.undecoded[name] = bytes;
          decodeSamples();
        });
      })
    );
  }

  function decodeSamples() {
    const graph = state.graph;
    if (!graph || state.disposed) return;
    [...SOUND_NAMES, ...LOOP_NAMES].forEach((name) => {
      const bytes = state.undecoded[name];
      const entry = SOUND_SAMPLES[name];
      if (bytes === undefined || entry.kind === "synthesized") return;
      delete state.undecoded[name];
      graph.context
        .decodeAudioData(bytes)
        .then((buffer) => {
          if (state.disposed) return;
          const channels = Array.from(
            { length: buffer.numberOfChannels },
            (_, index) => buffer.getChannelData(index)
          );
          state.samples[name] = {
            buffer,
            gain: getPeakGain(channels) * entry.gain,
            lengthMs: "lengthMs" in entry ? entry.lengthMs : undefined,
          };
          swapInSampleLoop(name);
        })
        .catch(() => undefined);
    });
  }

  function swapInSampleLoop(name: SampleName) {
    const loopName = LOOP_NAMES.find((loop) => loop === name);
    if (loopName === undefined || state.sampleLoops[loopName]) return;
    const synthLoop = state.activeLoops[loopName];
    if (synthLoop === undefined) return;
    synthLoop.stop(LOOP_FADE_OUT_MS);
    delete state.activeLoops[loopName];
    startWantedLoops();
  }

  function buildGraph(): Graph {
    const context = createContext();
    const master = context.createGain();
    master.gain.value = state.muted ? 0 : MASTER_LEVEL;
    master.connect(context.destination);
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.25;
    compressor.connect(master);
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = MASTER_LOWPASS_HZ;
    lowpass.Q.value = 0.5;
    lowpass.connect(compressor);
    const bus = context.createGain();
    bus.connect(lowpass);
    bus.connect(
      createRoomTail({
        context,
        destination: lowpass,
        wet: 0.2,
        feedback: 0.35,
        dampingHz: 3500,
      })
    );
    return { context, bus, master };
  }

  function getRunningGraph() {
    const graph = state.graph;
    if (!graph || state.disposed || graph.context.state !== "running") return;
    return graph;
  }

  function startWantedLoops() {
    const graph = getRunningGraph();
    if (!graph) return;
    LOOP_NAMES.filter(
      (name) => state.wantedLoops[name] && !state.activeLoops[name]
    ).forEach((name) => {
      const sample = state.samples[name];
      const voice = {
        context: graph.context,
        destination: graph.bus,
        fadeInMs: LOOP_FADE_IN_MS,
      };
      if (sample === undefined) {
        state.activeLoops[name] = LOOPS[name]({ ...voice, volume: 1 });
        return;
      }
      state.sampleLoops[name] = true;
      state.activeLoops[name] = startSampleLoop({
        ...voice,
        buffer: sample.buffer,
        volume: sample.gain,
      });
    });
  }

  return {
    play(name: SoundName, playOptions?: { volume?: number }) {
      const graph = getRunningGraph();
      if (!graph || state.muted) return;
      const volume = playOptions?.volume ?? 1;
      const sample = state.samples[name];
      const voice = { context: graph.context, destination: graph.bus };
      if (sample === undefined) {
        ONE_SHOTS[name]({ ...voice, volume });
        return;
      }
      playSample({
        ...voice,
        buffer: sample.buffer,
        volume: volume * sample.gain,
        lengthMs: sample.lengthMs,
      });
    },
    startLoop(name: LoopName) {
      state.wantedLoops[name] = true;
      startWantedLoops();
    },
    stopLoop(name: LoopName) {
      delete state.wantedLoops[name];
      state.activeLoops[name]?.stop(LOOP_FADE_OUT_MS);
      delete state.activeLoops[name];
      delete state.sampleLoops[name];
    },
    hasSample(name: SampleName) {
      return state.samples[name] !== undefined;
    },
    setMuted(muted: boolean) {
      state.muted = muted;
      if (state.graph !== undefined) requestSamples();
      const graph = state.graph;
      if (!graph) return;
      const nowS = graph.context.currentTime;
      const currentGain = graph.master.gain.value;
      graph.master.gain.cancelScheduledValues(nowS);
      graph.master.gain.setValueAtTime(currentGain, nowS);
      graph.master.gain.setTargetAtTime(
        muted ? 0 : MASTER_LEVEL,
        nowS,
        MUTE_TIME_CONSTANT_S
      );
    },
    async resume() {
      if (state.disposed) return;
      const graph = state.graph ?? buildGraph();
      state.graph = graph;
      requestSamples();
      decodeSamples();
      if (graph.context.state !== "running") await graph.context.resume();
      startWantedLoops();
    },
    dispose() {
      if (state.disposed) return;
      state.disposed = true;
      LOOP_NAMES.forEach((name) => state.activeLoops[name]?.stop(0));
      state.activeLoops = {};
      state.wantedLoops = {};
      void state.graph?.context.close();
    },
  };
}
