import assert from "node:assert/strict";
import { test } from "node:test";

import { createSoundBoard } from "./create-sound-board";

function buildParam(options: { value: number }) {
  return {
    value: options.value,
    setValueAtTime() {},
    cancelScheduledValues() {},
    setTargetAtTime() {},
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {},
  };
}

function buildFakeContext(options: { starts: string[] }) {
  function buildNode(node: { name: string }) {
    return {
      gain: buildParam({ value: 1 }),
      frequency: buildParam({ value: 0 }),
      Q: buildParam({ value: 0 }),
      threshold: buildParam({ value: 0 }),
      knee: buildParam({ value: 0 }),
      ratio: buildParam({ value: 0 }),
      attack: buildParam({ value: 0 }),
      release: buildParam({ value: 0 }),
      delayTime: buildParam({ value: 0 }),
      playbackRate: buildParam({ value: 1 }),
      buffer: undefined,
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      type: "",
      onended: undefined,
      connect(destination: unknown) {
        return destination;
      },
      disconnect() {},
      start() {
        options.starts.push(node.name);
      },
      stop() {},
    };
  }
  const context = {
    state: "suspended",
    currentTime: 0,
    sampleRate: 44100,
    destination: buildNode({ name: "destination" }),
    createGain: () => buildNode({ name: "gain" }),
    createDynamicsCompressor: () => buildNode({ name: "compressor" }),
    createBiquadFilter: () => buildNode({ name: "filter" }),
    createDelay: () => buildNode({ name: "delay" }),
    createOscillator: () => buildNode({ name: "oscillator" }),
    createBufferSource: () => buildNode({ name: "buffer-source" }),
    createBuffer: (channels: number, length: number) => ({
      numberOfChannels: channels,
      length,
      duration: length / 44100,
      getChannelData: () => new Float32Array(length),
    }),
    decodeAudioData: async () => ({
      numberOfChannels: 1,
      length: 1,
      duration: 1,
      getChannelData: () => Float32Array.from([0.5]),
    }),
    async resume() {
      context.state = "running";
    },
    async close() {},
  };
  return context;
}

function isAudioContext(value: unknown): value is AudioContext {
  return typeof value === "object" && value !== null && "createGain" in value;
}

const LISTED_NAMES = ["done-ding", "knob-click", "washer-running"] as const;

function buildBoard(options: {
  sampleNames: (typeof LISTED_NAMES)[number][];
  starts: string[];
}) {
  const context = buildFakeContext({ starts: options.starts });
  assert.ok(isAudioContext(context));
  return createSoundBoard({
    createContext: () => context,
    fetchIndex: async () =>
      LISTED_NAMES.filter((name) => options.sampleNames.includes(name)),
    fetchSample: async () => new ArrayBuffer(8),
  });
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 10));
}

test("a muted board starts no sound until unmuted", async () => {
  const starts: string[] = [];
  const board = buildBoard({ sampleNames: ["knob-click"], starts });
  await board.resume();
  await settle();
  board.setMuted(true);
  board.play("knob-click");
  assert.deepEqual(starts, [], "nothing plays while muted");
  board.setMuted(false);
  board.play("knob-click");
  assert.ok(starts.length > 0, "the click plays once unmuted");
  board.dispose();
});

test("a synthesized sound stays synthesized even when a file is listed", async () => {
  const board = buildBoard({
    sampleNames: ["done-ding", "knob-click"],
    starts: [],
  });
  await board.resume();
  await settle();
  assert.equal(board.hasSample("done-ding"), false);
  assert.equal(board.hasSample("knob-click"), true);
  board.dispose();
});

test("a loop sample replaces the synthesized loop once it decodes", async () => {
  const starts: string[] = [];
  const board = buildBoard({ sampleNames: ["washer-running"], starts });
  board.startLoop("washer-running");
  await board.resume();
  assert.ok(starts.includes("oscillator") || starts.includes("buffer-source"));
  await settle();
  assert.equal(board.hasSample("washer-running"), true);
  assert.ok(
    starts.filter((name) => name === "buffer-source").length >= 1,
    "the decoded loop starts as a buffer source"
  );
  board.dispose();
});

test("no sample is fetched before the first resume", async () => {
  const fetched: string[] = [];
  const context = buildFakeContext({ starts: [] });
  assert.ok(isAudioContext(context));
  const board = createSoundBoard({
    createContext: () => context,
    fetchIndex: async () => {
      fetched.push("index");
      return [];
    },
  });
  await settle();
  assert.deepEqual(fetched, []);
  await board.resume();
  assert.deepEqual(fetched, ["index"]);
  board.dispose();
});
