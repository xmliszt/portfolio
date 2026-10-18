import { createRoomTail } from "./sounds/create-room-tail";
import { playCameraEject } from "./sounds/play-camera-eject";
import { playCameraShutter } from "./sounds/play-camera-shutter";
import { playCoffeeBeep } from "./sounds/play-coffee-beep";
import { playCoffeeBrewDone } from "./sounds/play-coffee-brew-done";
import { playCoffeePour } from "./sounds/play-coffee-pour";
import { playCoffeeSip } from "./sounds/play-coffee-sip";
import { playCoffeeSwitch } from "./sounds/play-coffee-switch";
import { playCollectLaundry } from "./sounds/play-collect-laundry";
import { playCrayonScratch } from "./sounds/play-crayon-scratch";
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
import { playPrinterFeed } from "./sounds/play-printer-feed";
import { playRoomDoorOpen } from "./sounds/play-room-door-open";
import { playSample } from "./sounds/play-sample";
import { playShopBell } from "./sounds/play-shop-bell";
import { playSlidingDoor } from "./sounds/play-sliding-door";
import { playStartButton } from "./sounds/play-start-button";
import { playThunderRumble } from "./sounds/play-thunder-rumble";
import { playTouchGrass } from "./sounds/play-touch-grass";
import { playToyBoxOpen } from "./sounds/play-toy-box-open";
import { playToyCarLaunch } from "./sounds/play-toy-car-launch";
import { playToyHoverJets } from "./sounds/play-toy-hover-jets";
import { playToyThruster } from "./sounds/play-toy-thruster";
import { playTvStatic } from "./sounds/play-tv-static";
import { startCoffeeBrewing } from "./sounds/start-coffee-brewing";
import { startDryerRunning } from "./sounds/start-dryer-running";
import { startPrinterMotor } from "./sounds/start-printer-motor";
import { startRainOutside } from "./sounds/start-rain-outside";
import { startSampleLoop } from "./sounds/start-sample-loop";
import { startTvNoSignal } from "./sounds/start-tv-no-signal";
import { startWasherRunning } from "./sounds/start-washer-running";
import type { LoopHandle, VoiceOptions } from "./sounds/voice-options";
import { getPeakGain } from "./get-peak-gain";
import type { RoomSoundGroup, RoomSoundVolumes } from "./room-sound-groups";
import { ROOM_SOUND_VOLUME } from "./room-sound-groups";
import type { LoopName, SoundName } from "./sound-names";
import { LOOP_NAMES, SOUND_NAMES } from "./sound-names";
import { SOUND_SAMPLE_BASE_PATH, SOUND_SAMPLES } from "./sound-samples";

const MASTER_LEVEL = 0.5;
const MASTER_LOWPASS_HZ = 9000;
const MUTE_TIME_CONSTANT_S = 0.03;
const LOOP_FADE_IN_MS = 700;
const LOOP_FADE_OUT_MS = 600;
const GROUP_TIME_CONSTANT_S = 0.04;
const ANALYSER_FFT_SIZE = 512;

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
  "shop-bell": playShopBell,
  "thunder-rumble": playThunderRumble,
  "printer-feed": playPrinterFeed,
  "toy-box-open": playToyBoxOpen,
  "toy-car-launch": playToyCarLaunch,
  "toy-thruster": playToyThruster,
  "toy-hover-jets": playToyHoverJets,
  "camera-shutter": playCameraShutter,
  "camera-eject": playCameraEject,
  "crayon-scratch": playCrayonScratch,
} satisfies { [name in SoundName]: (options: VoiceOptions) => void };

const LOOPS = {
  "washer-running": startWasherRunning,
  "dryer-running": startDryerRunning,
  "coffee-brewing": startCoffeeBrewing,
  "tv-no-signal": startTvNoSignal,
  "rain-outside": startRainOutside,
  "printer-motor": startPrinterMotor,
} satisfies {
  [name in LoopName]: (
    options: VoiceOptions & { fadeInMs: number }
  ) => LoopHandle;
};

type Meter = { analyser: AnalyserNode; samples: Float32Array };

type Graph = {
  context: AudioContext;
  bus: GainNode;
  master: GainNode;
  groups: { [group in RoomSoundGroup]: { gain: GainNode; meter: Meter } };
  masterMeter: Meter;
};

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

function getDestination(graph: Graph, group: RoomSoundGroup | undefined) {
  return group === undefined ? graph.bus : graph.groups[group].gain;
}

function createMeter(context: AudioContext): Meter {
  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_FFT_SIZE;
  return { analyser, samples: new Float32Array(analyser.fftSize) };
}

function readMeter(meter: Meter) {
  meter.analyser.getFloatTimeDomainData(meter.samples);
  const sumOfSquares = meter.samples.reduce(
    (sum, sample) => sum + sample * sample,
    0
  );
  return Math.sqrt(sumOfSquares / meter.samples.length);
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
    wantedLoops: { [name in LoopName]?: { group?: RoomSoundGroup } };
    groupVolumes: RoomSoundVolumes;
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
    groupVolumes: {
      machines: ROOM_SOUND_VOLUME.usual,
      "shop-bell": ROOM_SOUND_VOLUME.usual,
      unloading: ROOM_SOUND_VOLUME.usual,
      coffee: ROOM_SOUND_VOLUME.usual,
      tv: ROOM_SOUND_VOLUME.usual,
      lamp: ROOM_SOUND_VOLUME.usual,
      weather: ROOM_SOUND_VOLUME.usual,
    },
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
    const masterMeter = createMeter(context);
    master.connect(masterMeter.analyser);
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
    function createGroup(group: RoomSoundGroup) {
      const gain = context.createGain();
      gain.gain.value = state.groupVolumes[group];
      gain.connect(bus);
      const meter = createMeter(context);
      gain.connect(meter.analyser);
      return { gain, meter };
    }
    const groups = {
      machines: createGroup("machines"),
      "shop-bell": createGroup("shop-bell"),
      unloading: createGroup("unloading"),
      coffee: createGroup("coffee"),
      tv: createGroup("tv"),
      lamp: createGroup("lamp"),
      weather: createGroup("weather"),
    };
    return { context, bus, master, groups, masterMeter };
  }

  function getRunningGraph() {
    const graph = state.graph;
    if (!graph || state.disposed || graph.context.state !== "running") return;
    return graph;
  }

  function startWantedLoops() {
    const graph = getRunningGraph();
    if (!graph) return;
    LOOP_NAMES.forEach((name) => {
      const wanted = state.wantedLoops[name];
      if (wanted === undefined || state.activeLoops[name]) return;
      if (state.samples[name] !== undefined) state.sampleLoops[name] = true;
      state.activeLoops[name] = startLoopVoice({
        graph,
        name,
        group: wanted.group,
      });
    });
  }

  function startLoopVoice(voice: {
    graph: Graph;
    name: LoopName;
    group: RoomSoundGroup | undefined;
  }) {
    const sample = state.samples[voice.name];
    const options = {
      context: voice.graph.context,
      destination: getDestination(voice.graph, voice.group),
      fadeInMs: LOOP_FADE_IN_MS,
    };
    if (sample === undefined) {
      return LOOPS[voice.name]({ ...options, volume: 1 });
    }
    return startSampleLoop({
      ...options,
      buffer: sample.buffer,
      volume: sample.gain,
    });
  }

  return {
    play(
      name: SoundName,
      playOptions?: { volume?: number; group?: RoomSoundGroup }
    ) {
      const graph = getRunningGraph();
      if (!graph || state.muted) return;
      const volume = playOptions?.volume ?? 1;
      const sample = state.samples[name];
      const voice = {
        context: graph.context,
        destination: getDestination(graph, playOptions?.group),
      };
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
    startLoop(name: LoopName, loopOptions?: { group?: RoomSoundGroup }) {
      state.wantedLoops[name] = { group: loopOptions?.group };
      startWantedLoops();
    },
    holdLoop(name: LoopName, loopOptions?: { group?: RoomSoundGroup }) {
      const graph = getRunningGraph();
      const handle =
        graph === undefined
          ? undefined
          : startLoopVoice({ graph, name, group: loopOptions?.group });
      return { stop: () => handle?.stop(LOOP_FADE_OUT_MS) };
    },
    setGroupVolume(group: RoomSoundGroup, volume: number) {
      state.groupVolumes[group] = volume;
      const graph = state.graph;
      if (graph === undefined) return;
      const { gain } = graph.groups[group].gain;
      const nowS = graph.context.currentTime;
      gain.cancelScheduledValues(nowS);
      gain.setTargetAtTime(volume, nowS, GROUP_TIME_CONSTANT_S);
    },
    getLevel(group?: RoomSoundGroup) {
      const graph = state.graph;
      if (graph === undefined) return 0;
      return readMeter(
        group === undefined ? graph.masterMeter : graph.groups[group].meter
      );
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
